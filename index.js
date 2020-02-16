const debug = require("debug")("index");
require("dotenv-json")();
const { to } = require("await-to-js");

async function main(params) {
  let error;
  let result;

  switch ((params.type || "").toLowerCase()) {
    case "": {
      return result;
    }

    default:
      return {
        error: {
          code: `unknown type used : ${params.type}`,
          message: params
        }
      };
  }
}

exports.main = main;
global.main = main;
