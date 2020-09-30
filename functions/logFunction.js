/* eslint-disable no-underscore-dangle */
const debug = require("debug")("logging:tofunction");

const fetch = require("node-fetch").default; // default export for webpack!
const { ibmFunctionCall } = require("./ibmFunctionCall");

function logMeta(data = {}) {
  try {
    const meta = {
      NODE_ENV: process.env.NODE_ENV,
      DEPLOY_VERSION: process.env.DEPLOY_VERSION,
      nameSpace: process.env.__OW_NAMESPACE,
      method: process.env.FUNCTION_METHOD,
      app: process.env.__OW_ACTION_NAME || "OWfunction",
      ...data
    };
    return meta;
  } catch (error) {
    console.error("error when trying to build error obj", error);
    return data;
  }
}

exports.addLogging = ({ target, level, message, data }) => {
  if (!message) {
    return console.warn("WARNING: call is missing message!");
  }
  const url = "https://c99a35b8.eu-de.apigw.appdomain.cloud/public/logging/";
  return ibmFunctionCall(
    url,
    {},
    { target, level, message, meta: logMeta(data) }
  );
};
