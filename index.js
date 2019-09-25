let dontEnvFile = {};
if (process.env.NODE_ENV !== "development") {
  dontEnvFile = { path: "./prodSettings" };
}
const debug = require("debug")("index");
require("dotenv").config(dontEnvFile);
const { to } = require("await-to-js");
const { CityNameResults } = require("./functions/search");

async function main(params) {
  let error;
  let result;
  const type = (params.type || "").toLowerCase();
  switch (type) {
    case "":
    case "search": {
      if (params.search) return CityNameResults(params.search);
      return [];
    }

    default:
      return {
        error: {
          code: `unknown type used : ${params.type}`,
          message: params.toString()
        }
      };
  }
}

exports.main = main;
global.main = main;
