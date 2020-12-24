import middy  from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createHttpError from "http-errors";
import cors from '@middy/http-cors';

import {getAuctionById} from "./getAuction";
import {uploadPictureToS3} from "../lib/uploadPictureToS3";
import {setAuctionPicture} from "../lib/setAuctionPicture";

export async function uploadAuctionPicture(event) {
    const { id } = event.pathParameters;
    const auction = await getAuctionById(id);
    const base64Image = event.body.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');

    let updatedAuction;
    try {
        const { Location } = await uploadPictureToS3(auction.id + '.jpg', buffer);
        updatedAuction = await setAuctionPicture(auction.id, Location);
    } catch (e) {
        console.error(e);
        throw new createHttpError.InternalServerError(e);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction)
    };
}

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler())
    .use(cors());
