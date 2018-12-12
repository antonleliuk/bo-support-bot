import { Context, HttpRequest, HttpStatusCode } from 'azure-functions-ts-essentials'
import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder';

import { SupportBot }  from '../src/bot';

const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword
});

const memoryStorage = new MemoryStorage();

const conversationState = new ConversationState(memoryStorage);

const myBot = new SupportBot(conversationState);

export function run (context : Context, req : HttpRequest) {
    context.log('JavaScript HTTP trigger function processed a request.');

    context.res.status = HttpStatusCode.OK;

    context.done(null, {});


}