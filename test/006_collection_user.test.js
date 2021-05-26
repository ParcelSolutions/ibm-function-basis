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

describe("collection_user", function() {
  let mongo;
  let existingUser;
  before(async function() {
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

  it("collection user get by email", async function() {
    const email = existingUser.emails[0].address;
    debug("email to test for", email);
    const User = await mongo.getModel("User");

    const result = await User.getByEmail(email);
    debug({ result });
    expect(result._id).to.equal(existingUser._id);
  });

  it("set process obj", async function() {
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

  it("set process obj on new user", async function() {
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
  describe("login token", function() {
    it("check non existing token", async function() {
      const User = await mongo.getModel("User");
      try {
        await User.checkLogin("a123");
      } catch (e) {
        expect(e.message).to.be.equal("userId not found");
      }
    });

    it("check existing expired token", async function() {
      const hashedToken = "/vrqgyDIt+CRzKAKZpXvb9wIfiMHtAd0Mam3v1b4cbI=";
      const loginToken = "UoWw3lozVrvO5ExbFV6Lo7IWpLYnZ4NTt7uvtyiLyX2";

      const User = await mongo.getModel("User");
      // set loginTokens in past
      await User.collection.updateOne(
        {
          _id: existingUser._id
        },
        {
          $set: {
            "services.resume.loginTokens": [
              {
                when: new Date("2000-04-14T17:55:51.076+0000"),
                hashedToken
              }
            ]
          }
        }
      );

      try {
        await User.checkLogin(loginToken);
      } catch (e) {
        expect(e.message).to.be.equal("expired token");
      }
    });

    it("check existing good token", async function() {
      const hashedToken = "/vrqgyDIt+CRzKAKZpXvb9wIfiMHtAd0Mam3v1b4cbI=";
      const loginToken = "UoWw3lozVrvO5ExbFV6Lo7IWpLYnZ4NTt7uvtyiLyX2";

      const User = await mongo.getModel("User");
      // set loginTokens today
      await User.collection.updateOne(
        {
          _id: existingUser._id
        },
        {
          $set: {
            "services.resume.loginTokens": [
              {
                when: new Date(),
                hashedToken
              }
            ]
          }
        }
      );

      const result = await User.checkLogin(loginToken);

      expect(result.userId).to.be.equal(existingUser._id);
    });
  });
});
