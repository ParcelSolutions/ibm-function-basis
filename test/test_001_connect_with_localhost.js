/* eslint-disable func-names */
const { expect } = require("chai");
const debug = require("debug")("test:localhost error mng");
// gets the global main function

const { MongoConnection } = require("../index");
require("../index");

describe("main-schema", function() {
  it("test localhost on prod", async function() {
    process.env.__OW_ACTIVATION_ID = "runID";
    // test existing post code

    expect(function() {
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
