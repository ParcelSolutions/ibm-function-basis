const debug = require("debug")(__filename.slice(__dirname.length + 1, -3));
const {logError} = require("./functions/sentryLogging");
const { to } = require("await-to-js");

async function main(params) {
  const {target} = params.env |||{};
  let uri;
        if (target === "test") {
          uri = params.MONGO_URI_TEST;
        } else if (target === "live") {
          uri = params.MONGO_URI_LIVE;
        } else if (target === "dev") {
          uri = params.MONGO_URI_DEV;
        } 
        else if (params.DB_URL) {
          // if db url is send in message
          uri = params.DB_URL;
        } else {
          throw Error("target not set");
        }
  let result;
  try {
    switch ((params.type || "").toLowerCase()) {
      case "": {
        return result;
      }

      default:
        Sentry.captureMessage('wrong type used:'+ type);
        return {
          error: {
            code: `unknown type used : ${params.type}`,
            message: "wrong type used",
            type: params.type,
            request: params.request
          }
        };
    }
  } catch (e) {
    console.error(e);
    logError(e, type, request);
    return {
      error: {
        code: "error while running function",
        message: e.message,
        type: params.type,
        request: params.request
      }
    };
  }
}

exports.main = main;
global.main = main;
