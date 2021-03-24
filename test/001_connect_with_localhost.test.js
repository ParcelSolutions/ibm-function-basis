/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { expect } = require("chai");
// const debug = require("debug")("test:localhost error mng");
// gets the global main function
let functionsToTest;
if (process.env.WEBPACK_TEST) {
  functionsToTest = require("../dist/bundle-local");
} else {
  functionsToTest = require("../index");
}

const { MongoConnection } = functionsToTest;
describe.skip("main-schema", function() {
  it("test localhost on prod", async function() {
    process.env.__OW_ACTIVATION_ID = "runID";
    // test existing post code

    expect(function() {
      // eslint-disable-next-line no-new
      new MongoConnection("mongodb://localhost:27017/myproject");
    }).to.throw("don't connect to localhost db when running on openwhisk!");
  });
  it("test localhost on local server", async function() {
    delete process.env.__OW_ACTIVATION_ID;
    // test existing post code

    expect(new MongoConnection("mongodb://localhost:27017/myproject")).to.be.an(
      "object"
    );
  });

  it("test remote on prod", async function() {
    process.env.__OW_ACTIVATION_ID = "runID";
    // test existing post code

    expect(new MongoConnection("mongodb://server:27017/myproject")).to.be.an(
      "object"
    );
  });
});
