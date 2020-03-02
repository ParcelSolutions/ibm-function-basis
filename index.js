const debug = require("debug")(__filename.slice(__dirname.length + 1, -3));
const Sentry = require("@sentry/node");

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    release: "FUNCTIONNAME@1.0",
    dsn: "https://e17259a66abc42618cfcc95ca89cc882@sentry.io/2627328"
  });
}

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
        } else {
          throw Error("target not set");
        }
  let error;
  let result;
  try {
    switch ((params.type || "").toLowerCase()) {
      case "": {
        return result;
      }

      default:
        Sentry.captureMessage('wrong type used');
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
    Sentry.captureException(e);
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
