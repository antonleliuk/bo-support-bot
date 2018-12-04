// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {ActionTypes, ActivityTypes, ConversationState, StatePropertyAccessor, TurnContext} from "botbuilder";
import {DialogSet} from "botbuilder-dialogs";


const DIALOG_STATE_PROPERTY = "dialogStateProperty";

export class MyBot {
    public conversationState : ConversationState;
    public dialogState : StatePropertyAccessor;
    public dialogs : DialogSet;
  /**
   *
   * @param conversationState conversation state object
   */
  constructor(conversationState : ConversationState) {
    // Creates a new state accessor property.
    // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
    this.conversationState = conversationState;
    this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);

    this.dialogs = new DialogSet(this.dialogState);

    // TODO add more dialogs
  }
  /**
   *
   * @param turnContext on turn context object.
   */
  async onTurn(turnContext : TurnContext) {
    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    if (turnContext.activity.type === ActivityTypes.Message) {
    } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
        if (turnContext.activity.membersAdded.length !== 0) {
            for(let idx in turnContext.activity.membersAdded){
                const recipient = turnContext.activity.membersAdded[idx].id;
                if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                    // TODO show welcome card
                    await turnContext.sendActivity({
                        type : ActivityTypes.Message,
                        text : 'Welcome! Some intro text if you are new?',
                        locale : 'uk',
                        suggestedActions: {
                            to: [
                                recipient
                            ],
                            actions: [
                                {
                                    type: ActionTypes.ImBack,
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

    } else {
      await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
    }
    // Save state changes
    await this.conversationState.saveChanges(turnContext);
  }
}
