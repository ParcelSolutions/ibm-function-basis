/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { expect } = require("chai");
const debug = require("debug")("test:redis");
// gets the global main function
let functionsToTest;
if (process.env.WEBPACK_TEST) {
  functionsToTest = require("../dist/bundle-local");
} else {
  functionsToTest = require("../index");
}

const { RedisConnection } = functionsToTest;
describe("redis", function() {
  it("test localhost on prod", async function() {
    const redis = new RedisConnection();
    debug("before connect %o", redis);
    await redis.connect();
    expect(redis.client.connected).to.be.eql(true);
  });
});
