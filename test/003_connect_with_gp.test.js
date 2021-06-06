/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { expect } = require("chai");
const debug = require("debug")("test:pg");
// gets the global main function
let functionsToTest;
if (process.env.WEBPACK_TEST) {
  functionsToTest = require("../dist/bundle-local");
} else {
  functionsToTest = require("../index");
}

const { PostgresConnection } = functionsToTest;
describe("pg", function() {
  this.timeout(5000);
  it("test pg connect", async function() {
    const pgConnect = new PostgresConnection(process.env.POSTGRESS_URI);
    const result = await pgConnect.testPgConnection();
    debug("result PG connect:", result);
    expect(result.now).to.be.a("date", "did not connect to db");
  });
  it("test default pg connect", async function() {
    const pgConnect = new PostgresConnection();
    const result = await pgConnect.testPgConnection();
    debug("result PG connect:", result);
    expect(result.now).to.be.a("date", "did not connect to db");
  });
  it("close connection", async function() {
    const pgConnect = new PostgresConnection(process.env.POSTGRESS_URI);
    const result = await pgConnect.close();
    debug("result PG connect:", result);
    expect(result).to.equal(true);
  });


});
