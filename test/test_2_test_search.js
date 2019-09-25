/* eslint-disable func-names */
const { assert } = require("chai");
const debug = require("debug")("test:split");
const Postgress = require("../database/postgress");
// gets the global main function

const { CityNameResults } = require("../functions/search.js");

// setup index pg

describe("search", function() {
  it("test if search works", async function() {
    const result = await CityNameResults("Antwerp");
    debug("result search : %j", result);
    assert.isArray(result, "did not return object");
  });
});
