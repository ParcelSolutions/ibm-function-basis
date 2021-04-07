/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const { expect } = require("chai");
const { v4: uuidv4 } = require("uuid");
const debug = require("debug")("test:collection:user");

let MongoConnection;
if (process.env.WEBPACK_TEST) {
  ({ MongoConnection } = require("../dist/bundle-local"));
} else {
  ({ MongoConnection } = require("../index"));
}

describe("collection_user", function () {
  let mongo;
  let existingUser;
  before(async function () {
    try {
      mongo = new MongoConnection(process.env.LOCAL_MONGO);
      await mongo.connect();
      const User = await mongo.getModel("User");
      existingUser = await User.collection.findOne({
        "emails.0.address": { $exists: true }
      });
    } catch (e) {
      throw new Error("no connection to db!");
    }
  });

  it("collection user get by email", async function () {
    const email = existingUser.emails[0].address;
    debug("email to test for", email);
    const User = await mongo.getModel("User");

    const result = await User.getByEmail(email);
    debug({ result });
    expect(result._id).to.equal(existingUser._id);
  });

  it("set process obj", async function () {
    const email = existingUser.emails[0].address;
    const { first, last } = existingUser.profile;
    debug("email to test for", email);
    const User = await mongo.getModel("User");
    const ts = new Date();
    const result = await User.createUserJob({
      first,
      last,
      email,
      data: { test: 1, ts }
    });
    debug({ result });
    expect(result._id).to.equal(existingUser._id);
    expect(result.isNew).to.equal(false);
  });

  it("set process obj on new user", async function () {
    const email = `${uuidv4()}@transmate.eu`;
    const { first, last } = existingUser.profile;
    debug("email to test for", email);
    const User = await mongo.getModel("User");
    const ts = new Date();
    const result = await User.createUserJob({
      first,
      last,
      email,
      data: { test: 1, ts }
    });
    debug("new user %o ", { result });
    expect(result._id).to.be.a("string");
    expect(result.isNew).to.equal(true);
    const deleteUser = await User.collection.deleteOne({
      _id: result._id
    });
    debug("delete of new User");
    expect(deleteUser.result.n).to.equal(1);
  });
});
