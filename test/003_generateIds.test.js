require("dotenv-json")();
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { expect } = require("chai");
const debug = require("debug")("test:generateIds");

const { MongoConnection, createdDT } = require("../../ibm-function-basis");
// gets the global main function

describe("getId", function() {
  it("test is we get an id", async function() {
    this.timeout(20000);
    let mongo;
    try {
      mongo = new MongoConnection(process.env.MONGO_URI_TEST);
      await mongo.connect();
    } catch (e) {
      throw new Error("no connection to db!");
    }
    const result = mongo.getId();
    const id = await result;
    debug({ id });
    expect(id).to.be.a("string");
  });

  it("test is we get an refNumber", async function() {
    this.timeout(20000);
    let mongo;
    try {
      mongo = new MongoConnection(process.env.MONGO_URI_TEST);
      await mongo.connect();
    } catch (e) {
      throw new Error("no connection to db!");
    }
    const result = mongo.getUniqueId({
      table: "shipments",
      key: "number",
      type: "shortRef",
    });
    const id = await result;
    debug("refNumber", { id });
    expect(id).to.be.a("string");
  });
  it("test is we get 10000 refNumbers", async function() {
    this.timeout(30000);
    let mongo;
    try {
      mongo = new MongoConnection(process.env.MONGO_URI_TEST);
      await mongo.connect();
    } catch (e) {
      throw new Error("no connection to db!");
    }
    const longArray = Array.from(Array(100));
    debug("elements %o", longArray.length);
    const results = await Promise.all(
      longArray.map(async (_) => {
        
        try {
          const result = mongo.getUniqueId({
            table: "shipments",
            key: "number",
            type: "shortRef",
          });

          return result;
        } catch (e) {
          console.error(e);
          return error;
        }
      })
    );
    results.forEach((id) => {
      debug("refNumber", { id });
      expect(id).to.be.a("string");
    });
  });
});
