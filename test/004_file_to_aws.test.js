/* eslint-disable func-names */
require("dotenv-json")();
const { expect } = require("chai");
const debug = require("debug")("test:store-file");
const { resolve } = require("path");

let uploadFileToAws;
if (process.env.WEBPACK_TEST) {
  ({ uploadFileToAws } = require("../dist/bundle-local"));
} else {
  ({ uploadFileToAws } = require("../functions/storeFiles"));
}

describe("store pdf", function() {
  it("upload to aws", async function() {
    // create template without data
    const path = resolve("./test/test_data/test-invoice-transmate.pdf");
    debug("use file :", path);
    const result = await uploadFileToAws(path);
    debug("aws result %o", result);
    expect(result).to.be.a("object");
    expect(result.Location).to.be.a("string");
    expect(result.Location).to.equal(
      "https://ondemandreports.s3.eu-central-1.amazonaws.com/test-invoice-transmate.pdf"
    );
  });

  it("upload to aws unique filename", async function() {
    // create template without data
    const path = resolve("./test/test_data/test-invoice-transmate.pdf");
    debug("use file :", path);
    const result = await uploadFileToAws(path, {
      generateUniqueFileName: true
    });
    debug("aws result %o", result);
    expect(result).to.be.a("object");
    expect(result.Location).to.be.a("string");
    expect(result.Location).includes("_test-invoice-transmate.pdf");
  });

  it("upload to aws specific bucket", async function() {
    // create template without data
    const path = resolve("./test/test_data/test-invoice-transmate.pdf");
    debug("use file :", path);
    const result = await uploadFileToAws(path, {
      Key: "documents/shipment/test/test",
      Bucket: "files.transmate.eu"
    });
    debug("aws result %o", result);
    expect(result).to.be.a("object");
    expect(result.Location).to.be.a("string");
    expect(result.Location).includes(
      "files.transmate.eu/documents/shipment/test/test"
    );
  });
});
