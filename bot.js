"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
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
const DIALOG_STATE_PROPERTY = "dialogStateProperty";
class SupportBot {
    /**
     *
     * @param conversationState conversation state object
     */
    constructor(conversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.conversationState = conversationState;
        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
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
                                            title: 'Need help',
                                            value: ':needHelp',
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
                yield turnContext.sendActivity(`[${turnContext.activity.type} event detected] v2`);
            }
            // Save state changes
            yield this.conversationState.saveChanges(turnContext);
        });
    }
}
exports.SupportBot = SupportBot;
