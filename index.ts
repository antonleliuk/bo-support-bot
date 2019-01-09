// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import * as path from 'path';
import {config} from 'dotenv';
// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {BotFrameworkAdapter, ConversationState, MemoryStorage} from 'botbuilder';
// Import required bot configuration.
import {BotConfiguration, IEndpointService, IQnAService, LuisService, BlobStorageService} from 'botframework-config';
// This bot's main dialog.
import {SupportBot} from './src/bot';

import {LuisApplication, QnAMakerEndpoint,} from 'botbuilder-ai';

import { BlobStorage, BlobStorageSettings } from 'botbuilder-azure'

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '.env');
const env = config({ path: ENV_FILE });

// bot endpoint name as defined in .bot file
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration .
const DEV_ENVIRONMENT = 'development';

// bot name as defined in .bot file
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);

const QNA_CONFIGURATION = 'qnamakerService';

const LUIS_CONFIGURATION = 'luisService';

// Create HTTP server.
let server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open bo-support-bot-ts.bot file in the Emulator.`);
});

// .bot file path
const BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''));

// Read bot configuration from .bot file.
let botConfig;
try {
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.log(err);
    console.error(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`);
    console.error(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`);
    console.error(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.\n\n`);
    process.exit();
}

// Get bot endpoint configuration by service name
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION) as IEndpointService;

const qnaConfig = botConfig.findServiceByNameOrId(QNA_CONFIGURATION) as IQnAService;

const luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION) as LuisService;

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration .
const adapter = new BotFrameworkAdapter({
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword
});

// Map the contents to the required format for QnAMaker.
const qnaEndpointSettings: QnAMakerEndpoint = {
    endpointKey: qnaConfig.endpointKey,
    host: qnaConfig.hostname,
    knowledgeBaseId: qnaConfig.kbId,
};

// Map the contents to the required format for `LuisRecognizer`.
const luisApplication: LuisApplication = {
    applicationId: luisConfig.appId,
    endpoint: luisConfig.getEndpoint(),
    endpointKey: luisConfig.subscriptionKey,
};
// Define a state store for your bot.
// See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.
// const memoryStorage = new MemoryStorage();
// CAUTION: You must ensure your product environment has the NODE_ENV set
//          to use the Azure Blob storage or Azure Cosmos DB providers.
// const { BlobStorage } = require('botbuilder-azure');
// Storage configuration name or ID from .bot file
const STORAGE_CONFIGURATION_ID = 'storageService';
// // Default container name
const DEFAULT_BOT_CONTAINER = 'bo-support-container';
// // Get service configuration
const blobStorageConfig = botConfig.findServiceByNameOrId(STORAGE_CONFIGURATION_ID) as BlobStorageService;
const blobStorage = new BlobStorage({
    containerName: (blobStorageConfig.container || DEFAULT_BOT_CONTAINER),
    storageAccountOrConnectionString: blobStorageConfig.connectionString
});
// conversationState = new ConversationState(blobStorage);

// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(blobStorage);

// Create the main dialog.
const myBot = new SupportBot(conversationState, qnaEndpointSettings, luisApplication);

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.load(context);
    await conversationState.clear(context);
    // Save state changes.
    await conversationState.saveChanges(context);
};


// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await myBot.onTurn(context);
    });
});

