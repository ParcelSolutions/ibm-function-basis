/* eslint-disable global-require */
/* eslint-disable func-names */

const { expect } = require("chai");
const debug = require("debug")("test:store-file");
const { resolve } = require("path");

let uploadFileToAws;
let getFileFromAws;
if (process.env.WEBPACK_TEST) {
  ({ uploadFileToAws, getFileFromAws } = require("../dist/bundle-local"));
} else {
  ({ uploadFileToAws, getFileFromAws } = require("../functions/storeFiles"));
}

describe("aws", function() {
  this.timeout(20000);
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
    expect(result.Location).includes("files.transmate.eu");
    expect(result.Location).includes("/documents/shipment/test/test");
  });

  it("get logo transmate", async function() {
    const parms = {
      fileName: "./test/test_data/logo-transmate.png",
      Bucket: "files.transmate.eu",
      Key: "logos/transmate/logo_transmate_transparent.png"
    };

    const result = await getFileFromAws(parms);
    expect(result).to.be.a("object");
    expect(result.fileName).to.be.a("string");
  });
});
