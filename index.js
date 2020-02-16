const debug = require("debug")("index");
require("dotenv-json")();
const { to } = require("await-to-js");

async function main(params) {
  let error;
  let result;
  try {
    switch ((params.type || "").toLowerCase()) {
      case "": {
        return result;
      }

      default:
        return {
          error: {
            code: `unknown type used : ${params.type}`,
            message: "see log for more information!",
            type: params.type,
            request: params.request
          }
        };
    }
  } catch (e) {
    console.error(e);

    return {
      error: {
        code: "error while running function",
        message: "see log for more information!",
        type: params.type,
        request: params.request
      }
    };
  }
}

exports.main = main;
global.main = main;
