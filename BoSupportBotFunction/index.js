"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function run(context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    context.res.body = 'Hello you!';
}
exports.run = run;
