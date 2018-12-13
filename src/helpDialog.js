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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
class HelpDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, qnaConfig) {
        super(dialogId);
        this.qnaMaker = new botbuilder_ai_1.QnAMaker(qnaConfig, { top: 1, scoreThreshold: 0.5 });
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [
            this.askQuestionForHelp.bind(this),
            this.displayHelpResults.bind(this)
        ]));
    }
    askQuestionForHelp(step) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield step.prompt("HELP_DIALOG", 'Ask question');
        });
    }
    displayHelpResults(step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
            const qnaResults = yield this.qnaMaker.getAnswers(step.context);
            // If an answer was received from QnA Maker, send the answer back to the user.
            if (qnaResults[0]) {
                yield step.context.sendActivity(qnaResults[0].answer);
                // If no answers were returned from QnA Maker, reply with help.
            }
            else {
                yield step.context.sendActivity('No QnA Maker answers were found. This example uses a QnA Maker Knowledge Base that focuses on smart light bulbs. To see QnA Maker in action, ask the bot questions like "Why won\'t it turn on?" or say something like "I need help."');
            }
            return step.endDialog();
        });
    }
}
exports.HelpDialog = HelpDialog;
