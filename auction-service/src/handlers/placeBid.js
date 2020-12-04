import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createHttpError from "http-errors";
import {getAuctionById} from "./getAuction";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;

    const auction = await getAuctionById(id);
    if(auction.status !== 'open') {
        throw new createHttpError.Forbidden(`You  cannot bid on closed auctions`);
    }

    if(amount <= auction.highestBid.amount) {
        throw new createHttpError.Forbidden(` Your bid must be higher than ${auction.highestBid.amount}`);
    }

    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount',
      ExpressionAttributeValues: {
          ':amount': amount,
      },
        ReturnValues: 'ALL_NEW',
    };

    let updatedAuction;

    try {
        const result = await dynamodb.update(params).promise();
        updatedAuction = result.Attributes;
    } catch (error) {
        console.error(error);
        throw new createHttpError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
}

export const handler = commonMiddleware(placeBid);
