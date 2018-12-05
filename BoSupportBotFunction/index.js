"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_functions_ts_essentials_1 = require("azure-functions-ts-essentials");
function run(context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    context.res.body = 'Hello you!';
    context.res.status = azure_functions_ts_essentials_1.HttpStatusCode.OK;
    context.done(null, {});
}
exports.run = run;
