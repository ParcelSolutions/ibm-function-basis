// Load the SDK for JavaScript
const debug = require("debug")("aws");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch").default;
const https = require("https");

function getUrlFromBucket({ region }, { Bucket, Key }) {
  const regionString = region.includes("us-east-1") ? "" : `.${region}`;
  return `https://${Bucket}.s3${regionString}.amazonaws.com/${Key}`;
}

// const S3 = require("aws-sdk/clients/s3");
const {
  S3Client: S3,
  PutObjectCommand,
  HeadObjectCommand
} = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");

const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);

// const writeFile = util.promisify(fs.writeFile);
const s3Settings = {
  apiVersion: "2006-03-01",
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
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
async function sizeOf(s3, key, bucket) {
  const res = await s3.send(
    new HeadObjectCommand({ Key: key, Bucket: bucket })
  );
  // debug(res);
  return res.ContentLength;
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

  const s3 = new S3(s3Settings);
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
  const url = getUrlFromBucket(s3Settings, params);
  try {
    stored = await s3.send(new PutObjectCommand(params));

    stored.size = await sizeOf(s3, params.Key, params.Bucket);
    debug("Uploaded params:%o, result %o", params, stored);
  } catch (err) {
    console.error(err);
    throw err;
  }

  return { Location: url, url, stored };
};

exports.getFileFromAws = async ({ fileName, Bucket, Key }) => {
  if (typeof Bucket !== "string")
    throw Error("Bucket should be a valid string");
  if (typeof Key !== "string") throw Error("Key should be a valid string");
  if (typeof fileName !== "string")
    throw Error("fileName should be a valid string");
  const url = getUrlFromBucket(s3Settings, { Key, Bucket });

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false
  });
  const response = await fetch(url, {
    agent: httpsAgent
  });
  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(response.body, fs.createWriteStream(fileName));
  // await writeFile(fileName, data.body);
  debug("file downloaded successfully");
  return { fileName };
};
