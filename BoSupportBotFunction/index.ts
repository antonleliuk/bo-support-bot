import { Context, HttpRequest, HttpStatusCode } from 'azure-functions-ts-essentials'

export function run (context : Context, req : HttpRequest) {
    context.log('JavaScript HTTP trigger function processed a request.');

    context.res.body = 'Hello you!';
    context.res.status = HttpStatusCode.OK;

    context.done(null, {});
}