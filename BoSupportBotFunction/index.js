"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_functions_ts_essentials_1 = require("azure-functions-ts-essentials");
const botbuilder_1 = require("botbuilder");
const bot_1 = require("../src/bot");
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword
});
const memoryStorage = new botbuilder_1.MemoryStorage();
const conversationState = new botbuilder_1.ConversationState(memoryStorage);
const myBot = new bot_1.SupportBot(conversationState);
function run(context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    context.res.status = azure_functions_ts_essentials_1.HttpStatusCode.OK;
    context.done(null, {});
}
exports.run = run;
