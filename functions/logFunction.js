const debug = require("debug")("loggin:tofunction");

const rq = require("request");

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
    return { metadata: meta };
  } catch (error) {
    console.error("error when trying to build error obj", error);
    return { metadata: data };
  }
}
exports.addLogging = ({ target, level, message, data }) => {
  if (!message) {
    return console.warn("WARNING: call is missing message!");
  }
  return new Promise((resolve, reject) => {
    // use function to cover unique ids (loop) and only build that function once
    const url = "https://c99a35b8.eu-de.apigw.appdomain.cloud/public/logging/";
    rq.post(
      {
        headers: {
          "Content-Type": "application/json"
        },
        url,
        json: { target, level, message, meta: logMeta(data) }
      },
      (err, response, body) => {
        if (err) {
          debug("issue with call %j", err);
          reject(err);
        }
        debug("response: %o", response.statusCode);
        if (response && response.statusCode !== 200) {
          debug("status code not 200:", response.statusCode);
        }
        debug("body (ibm function answer) : %j", body);
        resolve({ statusCode: (response || {}).statusCode, body });
      }
    );
  });
};
