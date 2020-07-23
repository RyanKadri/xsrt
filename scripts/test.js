const aws = require("aws-sdk");

(async function () {
  const creds = new aws.SharedIniFileCredentials({ profile: "xsrt" });
  aws.config.credentials = creds;
  const s3 = new aws.S3();

  try {
    await s3.upload({ Bucket: "xsrt-storage", Key: "thing", Body: "test", accessKeyId: "asdasd" }).promise()
    console.log("Done")
  } catch(e) {
    console.error(e);
  }


})()
