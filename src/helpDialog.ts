import {
    TextPrompt,
    ComponentDialog,
    WaterfallDialog,
    WaterfallStepContext,
    PromptValidatorContext
} from "botbuilder-dialogs";
import {QnAMaker, QnAMakerEndpoint, QnAMakerResult} from "botbuilder-ai";

import {HelpState} from "./helpState";

export class HelpDialog extends ComponentDialog {

    private qnaMaker: QnAMaker;

    constructor(dialogId: string, qnaConfig: QnAMakerEndpoint) {
        super(dialogId);

        this.qnaMaker = new QnAMaker(qnaConfig, {top: 1, scoreThreshold: 0.5});


        this.addDialog(new WaterfallDialog<HelpState>("HELP_DIALOG_ID", [
            this.askQuestionForHelp.bind(this),
            this.displayHelpResults.bind(this)
        ]));

        this.addDialog(new TextPrompt("QUESTION_PROMPT", this.validateName));
    }

    private askQuestionForHelp = async (step : WaterfallStepContext<HelpState>) => {
        return await step.prompt("QUESTION_PROMPT", 'Ask the question');
    };

    private displayHelpResults = async (step: WaterfallStepContext<HelpState>) => {
        // Perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
        const qnaResults: QnAMakerResult[] = await this.qnaMaker.getAnswers(step.context);

        // If an answer was received from QnA Maker, send the answer back to the user.
        if (qnaResults[0]) {
            await step.context.sendActivity(qnaResults[0].answer);
        // If no answers were returned from QnA Maker, reply with help.
        } else {
            await step.context.sendActivity('No QnA Maker answers were found. This example uses a QnA Maker Knowledge Base that focuses on smart light bulbs. To see QnA Maker in action, ask the bot questions like "Why won\'t it turn on?" or say something like "I need help."');
        }
        return step.endDialog();
    };
    private NAME_LENGTH_MIN: number = 5;

    private validateName = async (validatorContext: PromptValidatorContext<string>) => {
        // Validate that the user entered a minimum lenght for their name
        const value = (validatorContext.recognized.value || '').trim();
        if (value.length >= this.NAME_LENGTH_MIN) {
            return true;
        } else {
            await validatorContext.context.sendActivity(`Names need to be at least ${ this.NAME_LENGTH_MIN } characters long.`);
            return false;
        }
    }
}
