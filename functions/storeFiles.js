// Load the SDK for JavaScript
const debug = require("debug")("aws");
const fs = require("fs");
const path = require("path");

const S3 = require("aws-sdk/clients/s3");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");

const util = require("util");

const writeFile = util.promisify(fs.writeFile);

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
function sizeOf(s3, key, bucket) {
  return s3
    .headObject({ Key: key, Bucket: bucket })
    .promise()
    .then(res => res.ContentLength);
}
exports.uploadFileToAws = async (
  filePath,
  options = {
    generateUniqueFileName: false,
    Bucket: undefined,
    Key: undefined
  }
) => {
  // Create S3 service object
  const s3 = new S3({
    apiVersion: "2006-03-01",
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
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
    ACL: "public-read",
    ContentType: mime.lookup(filePath),
    ResponseContentDisposition: `inline; filename='${path.basename(filePath)}'`
  };
  try {
    stored = await s3.upload(params).promise();
    stored.size = await sizeOf(s3, params.Key, params.Bucket);
    debug("Uploaded in:%s, %o", stored.Location, stored);
  } catch (err) {
    console.error(err);
    throw err;
  }

  return stored;
};

exports.getFileFromAws = async ({ fileName, Bucket, Key }) => {
  const s3 = new S3({
    apiVersion: "2006-03-01",
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  if (typeof Bucket !== "string")
    throw Error("Bucket should be a valid string");
  if (typeof Key !== "string") throw Error("Key should be a valid string");
  if (typeof fileName !== "string")
    throw Error("fileName should be a valid string");
  const data = await s3.getObject({ Bucket, Key }).promise();

  await writeFile(fileName, data.Body);
  debug("file downloaded successfully");
  return { fileName };
};
