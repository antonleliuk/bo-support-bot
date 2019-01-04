import {ComponentDialog, TextPrompt, WaterfallDialog, WaterfallStepContext} from "botbuilder-dialogs";
import {QnAMaker, QnAMakerEndpoint, QnAMakerResult} from "botbuilder-ai";

export class HelpDialog extends ComponentDialog {

    private qnaMaker: QnAMaker;

    constructor(dialogId: string, qnaConfig: QnAMakerEndpoint) {
        super(dialogId);

        this.qnaMaker = new QnAMaker(qnaConfig, {top: 1, scoreThreshold: 0.5});

        this.addDialog(new WaterfallDialog("QUESTION_DIALOG", [
            this.askQuestionForHelp.bind(this),
            this.displayHelpResults.bind(this)
        ]))

        this.addDialog(new TextPrompt("QUESTION_DIALOG_ID"))
    }

    async askQuestionForHelp(step : WaterfallStepContext){
        return await step.prompt("QUESTION_DIALOG_ID", 'Ask question');
    }

    async displayHelpResults(step: WaterfallStepContext){
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
    }
}