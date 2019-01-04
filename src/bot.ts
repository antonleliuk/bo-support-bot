import {
    ActionTypes,
    ActivityTypes,
    ConversationState,
    RecognizerResult,
    StatePropertyAccessor,
    TurnContext
} from 'botbuilder';
import {DialogSet, DialogTurnResult, DialogTurnStatus} from 'botbuilder-dialogs';
import {LuisApplication, LuisPredictionOptions, LuisRecognizer, QnAMakerEndpoint} from 'botbuilder-ai';
import {HelpDialog} from './helpDialog';

const DIALOG_STATE_PROPERTY = 'dialogStateProperty';

export class SupportBot {
    private conversationState: ConversationState;
    private dialogState: StatePropertyAccessor;
    private dialogs: DialogSet;

    private luisRecognizer: LuisRecognizer;

    /**
     * @param conversationState conversation state object
     * @param qnaConfig QnA config
     * @param luisApplication luis application config
     */
    constructor(conversationState: ConversationState, qnaConfig: QnAMakerEndpoint, luisApplication: LuisApplication) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.conversationState = conversationState;
        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogState);

        this.dialogs.add(new HelpDialog('HELP_DIALOG', qnaConfig));



        // Create configuration for LuisRecognizer's runtime behavior.
        const luisPredictionOptions: LuisPredictionOptions = {
            includeAllIntents: true,
            log: true,
            staging: false,
        };

        this.luisRecognizer = new LuisRecognizer(luisApplication, luisPredictionOptions, true);

        // TODO add more dialogs
    }

    /**
     *
     * @param turnContext on turn context object.
     */
    async onTurn(turnContext: TurnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext!.activity.type === ActivityTypes.Event) {
            let dialogResult: DialogTurnResult;

            // Create a dialog context
            const dc = await this.dialogs.createContext(turnContext);

            dialogResult = await dc.continueDialog()

            if(!dc.context.responded){
                switch (dialogResult.status) {
                    case DialogTurnStatus.empty:
                        await dc.beginDialog('HELP_DIALOG')
                        break;
                    case DialogTurnStatus.waiting:
                        // The active dialog is waiting for a response from the user, so do nothing
                        break;
                    case DialogTurnStatus.complete:
                        await dc.endDialog();
                        break;
                    default:
                        await dc.cancelAllDialogs();
                        break;
                }
            }
        } else if (turnContext!.activity.type === ActivityTypes.Message) {

            let dialogResult: DialogTurnResult;

            // Create a dialog context
            const dc = await this.dialogs.createContext(turnContext);

            dialogResult = await dc.continueDialog()

            if(!dc.context.responded){
                switch (dialogResult.status) {
                    case DialogTurnStatus.empty:
                        // Perform a call to LUIS to retrieve results for the user's message.
                        const results: RecognizerResult = await this.luisRecognizer.recognize(turnContext);

                        // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
                        const topIntent = results.luisResult.topScoringIntent;

                        if (topIntent.intent === 'Help') {
                            await dc.beginDialog('HELP_DIALOG')
                            // await turnContext.sendActivity(`LUIS Top Scoring Intent: ${ topIntent.intent }, Score: ${ topIntent.score }`);
                        } else {
                            await dc.cancelAllDialogs()
                            // If the top scoring intent was 'None' tell the user no valid intents were found and provide help.
                            await turnContext.sendActivity('Sorry I can\'t understand. Show some help');
                        }
                        break;
                    case DialogTurnStatus.waiting:
                        // The active dialog is waiting for a response from the user, so do nothing
                        break;
                    case DialogTurnStatus.complete:
                        await dc.endDialog();
                        break;
                    default:
                        await dc.cancelAllDialogs();
                        break;
                }
            }

        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {

            if (turnContext.activity.membersAdded!.length !== 0) {
                for (let idx in turnContext!.activity!.membersAdded!) {
                    const recipient = turnContext.activity.membersAdded![idx].id;
                    if (turnContext.activity.membersAdded![idx].id !== turnContext.activity.recipient.id) {

                        // TODO show welcome card
                        await turnContext.sendActivity({
                            type: ActivityTypes.Message,
                            text: 'Welcome! Show some helpful text',
                            locale: 'uk',
                            suggestedActions: {
                                to: [
                                    recipient
                                ],
                                actions: [
                                    {
                                        type: ActionTypes.PostBack,
                                        title: 'Помощь',
                                        value: 'help',
                                        channelData: {}
                                    }
                                ]
                            }
                        });
                    }
                }
            }

        } else {
            await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}
