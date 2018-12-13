"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const helpDialog_1 = require("./helpDialog");
const DIALOG_STATE_PROPERTY = "dialogStateProperty";
class SupportBot {
    /**
     * @param conversationState conversation state object
     * @param qnaConfig QnA config
     * @param luisApplication luis application config
     */
    constructor(conversationState, qnaConfig, luisApplication) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.conversationState = conversationState;
        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        this.dialogs.add(new helpDialog_1.HelpDialog("HELP_DIALOG", qnaConfig));
        // Create configuration for LuisRecognizer's runtime behavior.
        const luisPredictionOptions = {
            includeAllIntents: true,
            log: true,
            staging: false,
        };
        this.luisRecognizer = new botbuilder_ai_1.LuisRecognizer(luisApplication, luisPredictionOptions, true);
        // TODO add more dialogs
    }
    /**
     *
     * @param turnContext on turn context object.
     */
    onTurn(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
            if (turnContext.activity.type === botbuilder_1.ActivityTypes.Message) {
                let dialogResult;
                // Create a dialog context
                const dc = yield this.dialogs.createContext(turnContext);
                dialogResult = yield dc.continueDialog();
                if (!dc.context.responded) {
                    switch (dialogResult.status) {
                        case botbuilder_dialogs_1.DialogTurnStatus.empty:
                            // Perform a call to LUIS to retrieve results for the user's message.
                            const results = yield this.luisRecognizer.recognize(turnContext);
                            // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
                            const topIntent = results.luisResult.topScoringIntent;
                            if (topIntent.intent === 'Help') {
                                yield dc.beginDialog("HELP_DIALOG");
                                // await turnContext.sendActivity(`LUIS Top Scoring Intent: ${ topIntent.intent }, Score: ${ topIntent.score }`);
                            }
                            else {
                                // If the top scoring intent was "None" tell the user no valid intents were found and provide help.
                                yield turnContext.sendActivity(`No LUIS intents were found.
                                                \nThis sample is about identifying two user intents:
                                                \n - 'Calendar.Add'
                                                \n - 'Calendar.Find'
                                                \nTry typing 'Add event' or 'Show me tomorrow'.`);
                            }
                            break;
                        default:
                            yield turnContext.sendActivity("Please type Help.");
                            break;
                    }
                }
            }
            else if (turnContext.activity.type === botbuilder_1.ActivityTypes.ConversationUpdate) {
                if (turnContext.activity.membersAdded.length !== 0) {
                    for (let idx in turnContext.activity.membersAdded) {
                        const recipient = turnContext.activity.membersAdded[idx].id;
                        if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                            // TODO show welcome card
                            yield turnContext.sendActivity({
                                type: botbuilder_1.ActivityTypes.Message,
                                text: 'Welcome! Some intro text if you are new?',
                                locale: 'uk',
                                suggestedActions: {
                                    to: [
                                        recipient
                                    ],
                                    actions: [
                                        {
                                            type: botbuilder_1.ActionTypes.PostBack,
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
            }
            else {
                yield turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
            }
            // Save state changes
            yield this.conversationState.saveChanges(turnContext);
        });
    }
}
exports.SupportBot = SupportBot;
