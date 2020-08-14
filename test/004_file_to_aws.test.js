/* eslint-disable func-names */
require("dotenv-json")();
const { expect } = require("chai");
const debug = require("debug")("test:store-file");
const { resolve } = require("path");
const { uploadFileToAws } = require("../functions/storeFiles");

describe("store pdf", function() {
  it("upload to aws", async function() {
    // create template without data
    const path = resolve("./test/test_data/test-invoice-transmate.pdf");
    debug("use file :", path);
    const result = await uploadFileToAws(path);
    debug("html %o", result);
    expect(result).to.be.a("object");
    expect(result.Location).to.be.a("string");
  });
});