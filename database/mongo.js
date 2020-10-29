/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

const { MongoClient } = require("mongodb");
const debug = require("debug")("mongo");
const MeteorRandom = require("meteor-random-node");
const { to } = require("await-to-js");
const { numberToString } = require("../functions/utils.js");
const Collections = require("./collections");

const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
let shortRefDuplicatesDetected = false;

// store last 10000 generated ids
const lastIds = Array.from(Array(10000));
let lastIdPos = 0;

const mongoConnection = {};
const uniqueIds = {};
function padding(pad, user_str, pad_pos) {
  if (typeof user_str === "undefined") return pad;
  if (pad_pos === "l") {
    return (pad + user_str).slice(-pad.length);
  }

  return (user_str + pad).substring(0, pad.length);
}
function createdDT(userId) {
  // debug("timestamp for %s", userId);
  return {
    by: userId || "function",
    at: new Date(),
    atms: Date.now()
  };
}

exports.MongoConnection = class MongoConnection {
  constructor(uri) {
    if (!uri || typeof uri !== "string") {
      throw Error("uri should always be set!");
    }
    if (
      process.env.__OW_ACTIVATION_ID &&
      (uri.includes("localhost") || uri.includes("127.0.0.1"))
    ) {
      throw Error("don't connect to localhost db when running on openwhisk!");
    }

    this.mongoSettings = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      sslValidate: false,
      poolSize: 5,
      bufferMaxEntries: 0,
      connectTimeoutMS: 5000,
      autoReconnect: false
    };

    this.uri = uri;
  }

  async getModel(name, env) {
    // user
    await this.connect();
    debug("get name %s from :%o", name, Object.keys(Collections));
    const CollectionModel = new Collections[name](this, env);

    return CollectionModel;
  }

  async connect() {
    if (!mongoConnection[this.uri]) {
      debug("setup connection with ", this.uri.slice(0, 12));
      try {
        const client = await MongoClient.connect(this.uri, this.mongoSettings);
        mongoConnection[this.uri] = client;
        console.log("start mongodb conn");
      } catch (error) {
        console.error(error);
        throw Error("not able to connect to db!");
      }
    } else {
      debug("connection exists !");
    }
    this.connection = mongoConnection[this.uri];
    return mongoConnection[this.uri];
  }

  async db(dbName) {
    try {
      const conn = await this.connect();
      if (!conn) throw Error("no db connection!");
      return conn.db(dbName);
    } catch (e) {
      throw e;
    }
  }

  async close(uri) {
    if (mongoConnection[this.uri || uri]) {
      console.log("mongoclient exists, lets close it!");
      try {
        const conn = await this.connect();
        if (!conn) throw Error("no db connection!");
        await conn.close();
        mongoConnection[this.uri || uri] = null;
      } catch (e) {
        throw e;
      }
    }
    return true;
  }

  async getIds(qty) {
    const ids = [];
    do {
      // eslint-disable-next-line no-await-in-loop
      ids.push(await this.getId());
    } while (ids.length < qty);
    return ids;
  }

  async getId() {
    // debug("uniqueIds %o, get 1", uniqueIds.length);
    try {
      if (!uniqueIds[this.uri] || uniqueIds[this.uri].length === 0) {
        await this.buildIds();
      }
      return uniqueIds[this.uri].pop();
    } catch (err) {
      throw err;
    }
  }

  async buildIds(
    qty = 100,
    collections = [
      "shipments",
      "stages",
      "items",
      "invoices",
      "invoices.items",
      "addresses"
    ]
  ) {
    const ids = [];
    for (let i = 0; i < qty; i++) {
      ids.push(MeteorRandom.id());
    }
    const results = await Promise.all(
      collections.map(collection =>
        this.find(collection, { _id: { $in: ids } }, { _id: 1 })
      )
    );
    const forDeletion = [];
    debug("result from db %o", results);
    results.forEach(result => result.forEach(obj => forDeletion.push(obj._id)));
    debug("result forDeletion db %o", forDeletion);
    debug(
      "lookup on ids : %o, rejected qty : %o",
      ids.length,
      forDeletion.length
    );
    // use set to make list unique
    uniqueIds[this.uri] = [...new Set(ids)].filter(
      id => !forDeletion.includes(id)
    );
    debug("ids %o", uniqueIds[this.uri]);
    return uniqueIds[this.uri];
  }

  async find(collection, query, fields) {
    debug("find query %j", query);
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!query || !fields) {
        reject(new Error("error collection , query or fields not set"));
      }
      conn
        .db()
        .collection(collection)
        .find(query, { projection: fields }, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            // cursor to array is a promise!
            resolve(r.toArray());
          }
        });
    });
  }

  async findOne(collection, query, options = { sort: { "created.at": -1 } }) {
    debug("findOne query %j on collection %s", query, collection);
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    if (!conn) throw Error("no db connection!");
    return new Promise((resolve, reject) => {
      if (!query || !collection) {
        reject(new Error("error collection or query not set"));
      }

      conn
        .db()
        .collection(collection)
        .findOne(query, options, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug("query %o on collection %s, found  %o", query, collection, r);
            resolve(r);
          }
        });
    });
  }

  async insertMany(collection, array) {
    const insertManyArray = array.map(obj => {
      if (!obj.created) {
        // eslint-disable-next-line no-param-reassign
        obj.created = createdDT("function");
      }
      return obj;
    });
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!insertManyArray || !insertManyArray.length > 0) {
        reject(new Error("error collection , array not set"));
      }
      conn
        .db()
        .collection(collection)
        .insertMany(insertManyArray, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug("inserted ex:  %o", insertManyArray[0]);
            debug("Number of documents inserted: %o", r.insertedCount);
            debug("result of insert many: %o", r);
            resolve(r);
          }
        });
    });
  }

  async insertOne(collection, obj) {
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!obj) {
        reject(new Error("error collection , obj not set"));
      }
      if (!obj.created) {
        // eslint-disable-next-line no-param-reassign
        obj.created = createdDT("function");
      }
      if (!obj.updated) {
        // eslint-disable-next-line no-param-reassign
        obj.updated = createdDT("function");
      }
      conn
        .db()
        .collection(collection)
        .insertOne(obj, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug("collection %s inserted ex:  %o ", collection, obj);
            debug("Number of documents inserted: %o", r.insertedCount);
            resolve(r);
          }
        });
    });
  }

  async updateOne(collection, query, update, options) {
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!collection || !query || !update) {
        reject(new Error("error collection , parameters not set"));
      }
      conn
        .db()
        .collection(collection)
        .updateOne(query, update, options, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug(
              "doc update done, ex update on collection %s, with query %o, update:  %o , modified %d",
              collection,
              query,
              update,
              r.modifiedCount
            );
            resolve(r);
          }
        });
    });
  }

  async updateMany(collection, query, update, options) {
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!collection || !query || !update) {
        reject(new Error("error collection , parameters not set"));
      }

      conn
        .db()
        .collection(collection)
        .updateMany(query, update, options, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug(
              "query %o, ex update obj: %o, for collection %s",
              query,
              update,
              collection
            );
            debug("Number of documents updated: %o", r.modifiedCount);
            resolve(r);
          }
        });
    });
  }

  async bulkWrite(collection, array) {
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      conn
        .db()
        .collection(collection)
        .bulkWrite(array, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug(
              "query, ex bulkWrite obj: %o, for collection %s",
              array,
              collection
            );
            debug("Number of documents updated: %o", r.modifiedCount);
            resolve(r);
          }
        });
    });
  }

  async deleteMany(collection, query) {
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!query || !collection) {
        reject(new Error("error collection , query not set"));
      }

      conn
        .db()
        .collection(collection)
        .deleteMany(query, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug("deleted %o, result %o", query, r.deletedCount);
            resolve(r);
          }
        });
    });
  }

  async createNotification(type, event, data) {
    debug("create a notification %o", { type, event, data });
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!type || !data || !event) {
        reject(new Error("error type/event or data not set"));
      }

      conn
        .db()
        .collection("worker.notifications")
        .insertOne({ type, event, data, createdDT: createdDT() }, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug("notification inserted type %o , event %o", type, event);
            resolve(r);
          }
        });
    });
  }

  async createActivity({ userId, accountId, activity, data }) {
    debug("create an activity registration %o", {
      userId,
      accountId,
      activity,
      data
    });
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!userId || !activity || !accountId) {
        resolve(null);
      }
      conn
        .db()
        .collection("users.activity")
        .insertOne(
          { userId, accountId, activity, data, ts: new Date() },
          (err, r) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              debug(
                "activity inserted account %o , activity %o",
                accountId,
                activity
              );
              resolve(r);
            }
          }
        );
    });
  }

  // eslint-disable-next-line class-methods-use-this
  generator(len) {
    return (
      [...Array(len)]
        // eslint-disable-next-line no-bitwise
        .map(() => allCapsAlpha[(Math.random() * allCapsAlpha.length) | 0])
        .join("")
    );
  }

  async getUniqueId({ table, key = "_id", type = "meteorId" }) {
    let id;
    let obj = true;

    try {
      do {
        switch (type) {
          case "meteorId": {
            id = MeteorRandom.id();
            break;
          }
          case "shortRef": {
            if (shortRefDuplicatesDetected) {
              id = this.generator(7);
            } else {
              const d = new Date();
              id =
                numberToString(d.getFullYear()) +
                numberToString(d.getMonth()) +
                numberToString(d.getDate()) +
                this.generator(3);
            }
            break;
          }

          default:
            throw Error(`type not existing:${type}`);
        }
        // eslint-disable-next-line no-await-in-loop
        obj =
          lastIds.includes(id) ||
          // eslint-disable-next-line no-await-in-loop
          (await this.findOne(table, { [key]: id }, { _id: 1 }));
        if (obj) shortRefDuplicatesDetected = true;
        // if shortRefNew and duplicate, switch to full random shortRef
      } while (obj); // continue when result is given (means it exists)
    } catch (err) {
      console.error(err);
      throw Error("issue when generating unique id");
    }
    lastIds[lastIdPos] = id;
    // eslint-disable-next-line no-unused-expressions
    lastIdPos === 9999 ? (lastIdPos = 0) : (lastIdPos += 1);
    return id;
  }

  async generateAccountId(type = "carrier") {
    let typeCode;
    const min = 1;
    const max = 99999;

    switch (type) {
      case "shipper":
        typeCode = "S";
        break;
      case "carrier":
        typeCode = "C";
        break;
      case "provider":
        typeCode = "P";
        break;
      default:
        typeCode = "S";
    }
    // try to create a new id for account and see if it is unique
    let accountId;

    try {
      let obj = true;
      do {
        const number = Math.floor(Math.random() * (max - min + 1) + min);
        accountId = `${typeCode}${padding("00000", number, "l")}`;
        debug("check account id :", accountId);
        // eslint-disable-next-line no-await-in-loop
        obj = await this.findOne("accounts", { _id: accountId }, { _id: 1 });
      } while (obj);
    } catch (err) {
      console.error(err);
      throw Error("issue when generating accountID");
    }

    return accountId;
  }

  // eslint-disable-next-line class-methods-use-this
  createdDT(user) {
    return createdDT(user);
  }

  static createdDT(userId) {
    return createdDT(userId);
  }
};
exports.createdDT = createdDT;

// close connections at end
// process.on("SIGINT", function() {
//   console.log("close mongo connections");
//   const connections = Object.keys(mongoConnection);
//   connections.forEach(uri => {
//     if (!connections[uri]) {
//       const mongoConn = new MongoConnection(uri);
//       mongoConn.close();
//     }
//   });
//   process.exit(0);
// });
