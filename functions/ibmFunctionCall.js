const debug = require("debug")("ibm-functions");

const rq = require("request");

exports.ibmFunctionCall = (url, { apiKey, token }, params) => {
  if (!url || (!apiKey && !token) || !params) {
    console.log(
      "WARNING: ibmFunctionCall call is missing some required keys, missing ibm function key or token!"
    );
  }
  return new Promise((resolve, reject) => {
    // use function to cover unique ids (loop) and only build that function once

    rq.post(
      {
        headers: {
          apiKey,
          Authorization: `Bearer ${token}`,
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
