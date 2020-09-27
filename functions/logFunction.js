/* eslint-disable no-underscore-dangle */
const debug = require("debug")("logging:tofunction");

const fetch = require("node-fetch").default; // default export for webpack!

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
  function checkStatus(res) {
    debug("result of call %o", res);
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    }
    throw Error(`wrong status code:${res.status}`);
  }
  return new Promise((resolve, reject) => {
    // use function to cover unique ids (loop) and only build that function once
    const url = "https://c99a35b8.eu-de.apigw.appdomain.cloud/public/logging/";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ target, level, message, meta: logMeta(data) })
    })
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        debug("body (ibm function answer) : %j", json);
        resolve({ statusCode: 200, json });
      })
      .catch(err => {
        debug("not able to convert to json %j", err);
        reject(err);
      });
  });
};
