/* eslint-disable import/prefer-default-export */
const isValidEmail = require("email-validator");
const debug = require("debug")("user");
const crypto = require("crypto");

function getHashedToken(loginToken) {
  const hash = crypto.createHash("sha256");
  hash.update(loginToken);
  return hash.digest("base64");
}

function maxExpiryDate() {
  // We pass when through the Date constructor for backwards compatibility;
  return new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days
}

class User {
  constructor(mongoFunctions, env) {
    this.collectionName = "users";
    this.env = env;
    try {
      this.mongoFunctions = mongoFunctions;
      // connection must already exist before calling this
      if (!mongoFunctions.connection) {
        throw Error("connect first before starting model");
      }
      this.mongo = mongoFunctions.connection;

      this.db = this.mongo.db();
      this.collection = this.mongo.db().collection(this.collectionName);
    } catch (e) {
      throw new Error("no connection to db!");
    }
    return this;
  }

  async getByEmail(email, options = { projection: { _id: 1 } }) {
    const user = await this.collection.findOne(
      { "emails.address": { $regex: email, $options: "i" } },
      options
    );

    return user;
  }

  async getById(userId, options = { projection: { _id: 1 } }) {
    const user = await this.collection.findOne({ _id: userId }, options);
    return user;
  }

  async checkAccountAccess(userId, accountId) {
    if (!userId) {
      throw Error("we need an userId to check access");
    }
    const accountIdToCheck = this.env.accountId || accountId;
    if (!accountIdToCheck) {
      throw Error(
        "we need an accountId to check agains, set env or add accountId to call"
      );
    }
    const role = await this.db.collection("role-assignment").findOne(
      {
        "user._id": userId,
        scope: `account-${accountIdToCheck}`
      },
      { projection: { _id: 1 } }
    );
    if (role) {
      return true;
    }
    return false;
  }

  async getAccountId(userId) {
    if (!userId) {
      throw Error("we need an userId to check access");
    }

    const roles = await this.db
      .collection("role-assignment")
      .findMany(
        {
          "user._id": userId,
          scope: { $exists: true }
        },
        { projection: { _id: 1, scope: 1 } }
      )
      .toArray();
    debug("roles %o for userId %s", roles, userId);
    const accountIds = new Set(roles.map(el => el.scope.split("-")[1]));

    debug(accountIds);
    if ([...accountIds].length > 0)
      console.warn("user is linked to multiple accountIds", accountIds);
    return [...accountIds][0];
  }

  async createUserJob({ first, last, email, data }) {
    let isNew = false;
    if (typeof email !== "string") {
      throw Error("email should be given, and should be string");
    }
    if (!isValidEmail.validate(email)) {
      throw Error(
        `user should always have a valid email! ${email} is not a valid email`
      );
    }
    let { _id: userId } = (await this.getByEmail(email)) || {};
    if (userId) {
      // user exists already
      debug("existing user, lets update userId %o", userId);
      await this.collection.updateOne(
        { _id: userId },
        { $set: { toProcess: data } }
      );
    } else {
      // user does not exist, get new id
      isNew = true;
      debug("new user lets get id");

      userId = await this.mongoFunctions.getUniqueId({
        table: this.collectionName
      });
      debug("new user, lets create userId %o", userId);
      await this.collection.insertOne({
        _id: userId,
        emails: [
          {
            address: email,
            verified: false
          }
        ],
        profile: {
          first,
          last
        },
        toProcess: { env: this.env, data },
        created: this.mongoFunctions.createdDT("server")
      });
    }
    return { _id: userId, isNew };
  }

  async checkLogin(loginToken) {
    if (!loginToken || typeof loginToken !== "string") {
      throw new Error("token must be set and must be a string!");
    }
    // there is a possible current user connected!
    if (loginToken) {
      // throw an error if the token is not a string

      // the hashed token is the key to find the possible current user in the db
      const hashedToken = getHashedToken(loginToken);

      // get the possible current user from the database
      // note: no need of a fiber aware findOne + a fiber aware call break tests
      // runned with practicalmeteor:mocha if eslint is enabled
      const currentUser = await await this.collection.findOne(
        {
          "services.resume.loginTokens.hashedToken": hashedToken
        },
        {
          projection: {
            "services.resume.loginTokens": 1
          }
        }
      );

      // the current user exists
      if (currentUser) {
        // find the right login token corresponding, the current user may have
        // several sessions logged on different browsers / computers
        const tokenInformation = currentUser.services.resume.loginTokens.find(
          tokenInfo => tokenInfo.hashedToken === hashedToken
        );

        // get an exploitable token expiration date
        const expiresAt = new Date(tokenInformation.when);

        // true if the token is expired
        const isExpired = expiresAt < maxExpiryDate();

        // if the token is still valid, give access to the current user
        // information in the resolvers context
        if (!isExpired) {
          // return a new context object with the current user & her id
          return {
            // eslint-disable-next-line no-underscore-dangle
            userId: currentUser._id
          };
        }
        throw new Error("expired token");
      }
    }

    throw new Error("userId not found");
  }
}

exports.User = User;
