const debug = require("debug")("ibm-functions");

const rq = require("request");

exports.ibmFunctionCall = (url, apiKey, params) => {
  if (!url || !apiKey || !params) {
    throw Error("missing ibm function key!");
  }
  return new Promise((resolve, reject) => {
    // use function to cover unique ids (loop) and only build that function once

    rq.post(
      {
        headers: {
          apiKey,
          "Content-Type": "application/json"
        },
        url,
        json: params
      },
      (err, response, body) => {
        if (err) {
          debug("issue with call %j", err);
          reject(err);
        }
        debug("response: %o", response.statusCode);
        if (response && response.statusCode !== 200) {
          console.log("status code not 200:", response.statusCode);
        }
        debug("body (ibm function answer) : %j", body);
        resolve({ statusCode: (response || {}).statusCode, body });
      }
    );
  });
};
