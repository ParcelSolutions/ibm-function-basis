/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { expect } = require("chai");
const debug = require("debug")("test:generateIds");

let MongoConnection;
if (process.env.WEBPACK_TEST) {
  ({ MongoConnection } = require("../dist/bundle-local"));
} else {
  ({ MongoConnection } = require("../index"));
}

describe("getId", function () {
  it("test is we get an id", async function () {

    this.timeout(20000);
    let mongo;
    try {
      mongo = new MongoConnection(process.env.LOCAL_MONGO);
      await mongo.connect();
    } catch (e) {
      throw new Error("no connection to db!");
    }
    const result = mongo.getId();
    const id = await result;
    debug({ id });
    expect(id).to.be.a("string");
  });

  it("test is we get an refNumber", async function () {
    this.timeout(20000);
    let mongo;
    try {
      mongo = new MongoConnection(process.env.LOCAL_MONGO);
      await mongo.connect();
    } catch (e) {
      throw new Error("no connection to db!");
    }
    const result = mongo.getUniqueId({
      table: "shipments",
      key: "number",
      type: "shortRef"
    });
    const id = await result;
    debug("refNumber", { id });
    expect(id).to.be.a("string");
    expect(id.length).to.be.greaterThan(3);
  });
  it("test is we get 10000 refNumbers", async function () {
    this.timeout(30000);
    let mongo;
    try {
      mongo = new MongoConnection(process.env.LOCAL_MONGO);
      await mongo.connect();
    } catch (e) {
      throw new Error("no connection to db!");
    }
    const longArray = Array.from(Array(100));
    debug("elements %o", longArray.length);
    const results = await Promise.all(
      // eslint-disable-next-line no-unused-vars
      longArray.map(async _el => {
        try {
          const result = mongo.getUniqueId({
            table: "shipments",
            key: "number",
            type: "shortRef"
          });

          return result;
        } catch (error) {
          console.error(error);
          return error;
        }
      })
    );
    results.forEach(id => {
      debug("refNumber", { id });
      expect(id).to.be.a("string");
    });
  });
});
