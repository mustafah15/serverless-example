import {getEndedAuctions} from "../lib/getEndedAuctions";
import {closeAuction} from "../lib/closeAuction";
import createHttpError from "http-errors";

async function processAuctions(event, context) {
    try{
        const auctionsToClose = await getEndedAuctions();
        const promises = auctionsToClose.map(auction => closeAuction(auction));

        await Promise.all(promises);
        return { closed: promises.length };
    }catch (error) {
        console.error(error);
        throw new createHttpError.InternalServerError(error);
    }
}

export const handler = processAuctions;