const { createdDT, MongoConnection } = require("./database/mongo");
const PostgresConnection = require("./database/postgress");
const RedisConnection = require("./database/redis");
const { setEnv } = require("./functions/setEnv");
const { getCloudUrl } = require("./setup/ibm-functions-defaults.js");
const { logError } = require("./functions/sentryLogging");
const closeConnections = require("./functions/closeConnections");
const { ibmFunctionCall } = require("./functions/ibmFunctionCall");
const { decodeBase64, checkAllParams } = require("./functions/utils");
const logActivity = require("./functions/logActivity");
const { addLogging } = require("./functions/logFunction");

const { uploadFileToAws, getFileFromAws } = require("./functions/storeFiles");

exports.getCloudUrl = getCloudUrl;
exports.createdDT = createdDT;
exports.MongoConnection = MongoConnection;
exports.PG = PostgresConnection;
exports.Pg = PostgresConnection;
exports.PostgresConnection = PostgresConnection;
exports.RedisConnection = RedisConnection;
exports.logError = logError;
exports.setEnv = setEnv;
exports.closeConnections = closeConnections;
exports.ibmFunctionCall = ibmFunctionCall;
exports.decodeBase64 = decodeBase64;
exports.checkAllParams = checkAllParams;
exports.logActivity = logActivity;

exports.uploadFileToAws = uploadFileToAws;
exports.getFileFromAws = getFileFromAws;
exports.addLogging = addLogging;


