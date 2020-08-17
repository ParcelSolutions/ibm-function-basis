// Load the SDK for JavaScript
const debug = require("debug")("aws");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
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

exports.uploadFileToAws = async (
  filePath,
  options = {
    generateUniqueFileName: false,
    Bucket: undefined,
    Key: undefined
  }
) => {
  // configuring parameters
  if (typeof filePath !== "string")
    throw Error("filePath should be a valid string");
  if (typeof options !== "object")
    throw Error("options should be a valid object");

  let stored;
  let awsFileName = path.basename(filePath);
  if (options.generateUniqueFileName) {
    awsFileName = `${Date.now()}_${uuidv4()}_${path.basename(filePath)}`;
  }
  const params = {
    Bucket: options.Bucket || process.env.AWS_S3_BUCKET,
    Body: fs.createReadStream(filePath),
    Key: options.Key || awsFileName,
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
