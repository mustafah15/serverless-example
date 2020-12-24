import AWS from 'aws-sdk';

const dynmodb = new AWS.DynamoDB.DocumentClient();

export async function setAuctionPicture(id, pictureUrl) {
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set pictureUrl = :pictureUrl',
        ExpressionAttributeValues: {
            ':pictureUrl': pictureUrl
        },
        ReturnValues: 'ALL_NEW'
    };

    const result = await dynmodb.update(params).promise();

    return result.Attributes;
}