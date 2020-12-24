import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import cors from '@middy/http-cors';

export default handler => middy(handler)
    .use([
        httpJsonBodyParser(),
        httpErrorHandler(),
        httpEventNormalizer(),
        cors(),
    ]);
