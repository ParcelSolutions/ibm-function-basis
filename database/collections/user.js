/* eslint-disable import/prefer-default-export */
const isValidEmail = require("email-validator");
const debug = require("debug")("user");

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
      .find(
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
}

exports.User = User;
