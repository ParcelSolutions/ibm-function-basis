/* eslint-disable func-names */
require("dotenv-json")();
const debug = require("debug");

if (process.env.DEBUG_LEVEL === "off") {
  // swith off debugging
  console.log("no debug info");
  debug.disable();
}

const { getCleanDb } = require("./start-mongo.js");

before(async function () {
  this.timeout(20000);
  console.log("setup test env");
  await getCleanDb();
  // console.log("JWT_SECRET", process.env.JWT_SECRET);
});
