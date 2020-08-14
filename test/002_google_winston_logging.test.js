require("dotenv-json")();

let Logging;
if (process.env.WEBPACK_TEST) {
  ({ Logging } = require("../dist/bundle-local"));
} else {
  ({ Logging } = require("../index"));
}

let logger;

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
  before(function() {
    logger = new Logging();
    logger.setup();
  });
  it("test logging", async function() {
    logger.add("info", "start app");
    logger.add("info", "test1", {
      userId: "1",
      accountId: "2",
      target: "test"
    });

    logger.add("debug", "test2", {});
    try {
      logger.add("warn", "test3", {
        userId: "1",
        accountId: "2",
        target: "test",
        extra: "extra data"
      });
      throw Error("test4 error throw");
    } catch (e) {
      logger.add("error", "test4", { error: e.stack });
    }
    // throw Error("test5 winston logging");
  });
});
