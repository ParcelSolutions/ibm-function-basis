/* eslint-disable global-require */
/* eslint-disable func-names */

const { expect } = require("chai");

let addLogging;
if (process.env.WEBPACK_TEST) {
  ({ addLogging } = require("../dist/bundle-local"));
} else {
  ({ addLogging } = require("../index"));
}

let logError;
if (process.env.WEBPACK_TEST) {
  ({ logError } = require("../dist/bundle-local"));
} else {
  ({ logError } = require("../index"));
}

// logger.info("Hello World", {
//   meta1: 1,
//   meta2: "string",
//   meta3: { deepObj: 1 },
//   NODE_ENV: 'development',
//   nameSpace: undefined,
//   method: undefined,
//   app: 'OWfunction',
//   userId: '2',
//   accountId: '3',
//   target: 'test'
// });
describe("logging", function() {
  this.timeout(5000);
  // eslint-disable-next-line func-names
  it("test addLogging", async function() {
    const result = await addLogging({
      target: "dev",
      type: "testing",
      level: "info",
      message: "start app"
    });
    expect(result.statusCode).to.equal(200);
    await addLogging({
      target: "dev",
      type: "testing",
      level: "debug",
      message: "test2"
    });
    try {
      throw Error("test4 error throw");
    } catch (e) {
      await addLogging({
        target: "dev",
        type: "testing",
        level: "error",
        message: "test4",
        error: e.stack
      });
    }
    // throw Error("test5 winston logging");
  });

  it("test logError", async function() {
    process.env.NODE_ENV = "test";
    process.env.SENTRY_DNS = process.env.TEST_SENTRY_DNS;
    const e = new Error("test error");
    const type = "testType";
    const request = { shipment: "testShipment" };
    const result = await logError(e, type, request);
    process.env.NODE_ENV = "development";
    process.env.SENTRY_DNS = null;
    expect(result).to.equal(true);
  });
});
