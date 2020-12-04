import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
    const now = new Date();

    const params = {
        TableName: process.envAUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        ExpressionAttributeValues: {
            ':status': 'OPEN',
            ':now': now.toISOString(),
        },
        // this because status is reserved word
        ExpressionAttributeNames: {
            '#status': 'status',
        }
    };

    const result = await dynamodb.query(params).promise();

    return result.Items;
}