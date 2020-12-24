import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction(auction) {
    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id: auction.id },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
          ':status': 'closed',
      },
    };

    await dynamodb.update(params).promise();

    const { title, seller, highestBid } = auction;
    const { amount, bidder } = highestBid;

    if(amount === 0) {
        await sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: 'no bids on your auction item!',
                recipient: seller,
                body: `your item ${title} did not get any bids.`,
            }),
        }).promise();

        return;
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
           subject: 'your item has been sold!',
           recipient: seller,
           body: `Wow! your item ${title} has been sold for $ ${amount}.`,
        }),
    }).promise();

    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'you won an auction!',
            recipient: bidder,
            body: `what a great deal you got yourself a ${title} for # ${amount}`,
        }),
    }).promise();

    return Promise.all([
       notifyBidder, notifySeller
    ]);
}