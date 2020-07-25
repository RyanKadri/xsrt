const aws = require("aws-sdk");

(async function () {
  const creds = new aws.SharedIniFileCredentials({ profile: "xsrt" });
  aws.config.credentials = creds;
  const s3 = new aws.S3();

  const queueUrl = "https://sqs.us-east-1.amazonaws.com/307651132348/xsrt-raw-chunks"
  const sqs = new aws.SQS({ region: "us-east-1" });

  sqs.receiveMessage({
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: queueUrl,
    VisibilityTimeout: 10,
    WaitTimeSeconds: 0
  }, (err, data) => {
    if (err) {
      console.error(err)
    } else if (data.Messages) {
      console.log(data.Messages);
      sqs.deleteMessage(
        { QueueUrl: queueUrl, ReceiptHandle: data.Messages[0].ReceiptHandle },
        (err) => {
          if(err) {
            console.log(`Error: ${err}`)
          }
        })
    }
  });

  setInterval(() => {}, 10000)

})()
