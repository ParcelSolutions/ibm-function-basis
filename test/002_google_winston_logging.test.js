/* eslint-disable global-require */
/* eslint-disable func-names */
require("dotenv-json")();

let addLogging;
if (process.env.WEBPACK_TEST) {
  ({ addLogging } = require("../dist/bundle-local"));
} else {
  ({ addLogging } = require("../index"));
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
  // eslint-disable-next-line func-names
  it("test logging", async function() {
    addLogging({ level: "info", message: "start app" });

    addLogging({ level: "debug", message: "test2" });
    try {
      throw Error("test4 error throw");
    } catch (e) {
      addLogging({ level: "error", message: "test4", error: e.stack });
    }
    // throw Error("test5 winston logging");
  });
});
