/* eslint-disable func-names */
const { assert } = require("chai");
const debug = require("debug")(__filename.slice(__dirname.length + 1, -3));
// gets the global main function
/* global main */
require("../index");

describe("main-schema", function() {
  it("test existing post code wrong request key", async function() {
    // test existing post code
    const result = await main({
      type: "test-on-a-non-existing-type"
    });
    debug("result wrong request result : %j", result);
    // assert.isArray(result.costs, 'costs is not an array');
    assert.isObject(result.error, "did not return error");
  });
});
