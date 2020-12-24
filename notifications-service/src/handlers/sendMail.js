import  AWS from 'aws-sdk';
const ses = new AWS.SES({region: 'eu-west-1'});

async function sendMail(event, context) {
  const record = event.Records[0];

  const email = JSON.parse(record.body);
  
  console.log('processing email', email);

  const { subject, body, recipient } = email;

  const params = {
    Source: 'mustafa.hussain93@gmail.com',
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export const handler = sendMail;
