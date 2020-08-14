// Load the SDK for JavaScript
const debug = require("debug")("aws");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
// Set the region
AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
/* 
// Call S3 to list the buckets
s3.listBuckets(err => {
  if (err) {
    console.error("AWS login error", err);
    throw Error(err);
  } else {
    // console.log("Success", data.Buckets);
  }
}); */

exports.uploadFileToAws = async filePath => {
  // configuring parameters
  let stored;
  const randomString = Math.random()
    .toString(36)
    .substring(2, 10);
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Body: fs.createReadStream(filePath),
    Key: `${Date.now()}_${randomString}_${path.basename(filePath)}`,
    ACL: "public-read"
  };
  try {
    stored = await s3.upload(params).promise();
    debug("Uploaded in:%s, %o", stored.Location, stored);
  } catch (err) {
    console.error(err);
    throw err;
  }

  return stored;
};
