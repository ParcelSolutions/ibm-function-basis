/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

const mongodb = require("mongodb");
const debug = require("debug")("mongo");
const MeteorRandom = require("meteor-random");

let mongoClient = {};
let uniqueIds = {};

function createdDT(userId) {
  // debug("timestamp for %s", userId);
  return {
    by: userId,
    at: new Date(),
    atms: Date.now()
  };
}

exports.MongoConnection = class MongoConnection {
  constructor(uri) {
    this.mongoClient = null;
    this.uri = uri;
    this._initialized = this._initialize();
  }

  async _initialize() {
    // actual async constructor logic

    if (!mongoClient[this.uri]) {
      debug("setup connection with ", this.uri);
      try {
        this.mongoClient = await mongodb.MongoClient.connect(this.uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          sslValidate: false
        });
        mongoClient[this.uri] = this.mongoClient;
      } catch (e) {
        debug("issue with db connnection", e);
        throw e;
      }
      if (!this.mongoClient) {
        throw Error("not able to connect to db!");
      }
    } else {
      debug("connection exists !");
      this.mongoClient = mongoClient[this.uri];
    }
  }

  async db() {
    try {
      const conn = await this.mongoClient;
      if (!conn) throw Error("no db connection!");
      return conn.db();
    } catch (e) {
      throw e;
    }
  }

  async close() {
    if (this.mongoClient) {
      console.log("mongoclient exists, lets close it!");
      const conn = await this.mongoClient;
      await conn.close();
      this.mongoClient = null;
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
      if (uniqueIds[this.uri].length === 0) {
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

    uniqueIds[this.uri] = ids.filter(id => !forDeletion.includes(id));
    debug("ids %o", uniqueIds[this.uri]);
    return uniqueIds[this.uri];
  }

  async find(collection, query, fields) {
    debug("find query %j", query);
    await this._initialized;
    return new Promise((resolve, reject) => {
      if (!query || !fields) {
        reject(new Error("error collection , query or fields not set"));
      }
      this.mongoClient
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
    await this._initialized;
    return new Promise((resolve, reject) => {
      if (!query || !collection) {
        reject(new Error("error collection or query not set"));
      }
      this.mongoClient
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
    await this._initialized;
    array = array.map(obj => {
      if (!obj.created) {
        obj.created = createdDT("function");
      }
      return obj;
    });
    return new Promise((resolve, reject) => {
      if (!array || !array.length > 0) {
        reject(new Error("error collection , array not set"));
      }
      this.mongoClient
        .db()
        .collection(collection)
        .insertMany(array, (err, r) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debug("inserted ex:  %o", array[0]);
            debug("Number of documents inserted: %o", r.insertedCount);
            debug("result of insert many: %o", r);
            resolve(r);
          }
        });
    });
  }

  async insertOne(collection, obj) {
    await this._initialized;
    return new Promise((resolve, reject) => {
      if (!obj) {
        reject(new Error("error collection , obj not set"));
      }
      if (!obj.created) {
        obj.created = createdDT("function");
      }
      this.mongoClient
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
    await this._initialized;
    return new Promise((resolve, reject) => {
      if (!collection || !query || !update) {
        reject(new Error("error collection , parameters not set"));
      }
      this.mongoClient
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
    await this._initialized;
    return new Promise((resolve, reject) => {
      if (!collection || !query || !update) {
        reject(new Error("error collection , parameters not set"));
      }
      this.mongoClient
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
    await this._initialized;
    return new Promise((resolve, reject) => {
      this.mongoClient
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
    await this._initialized;
    return new Promise((resolve, reject) => {
      if (!query || !collection) {
        reject(new Error("error collection , query not set"));
      }
      this.mongoClient
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
};
exports.createdDT = createdDT;

// close connections at end
// process.on("SIGINT", function() {
//   console.log("close mongo connections");
//   const connections = Object.keys(mongoClient);
//   connections.forEach(uri => {
//     if (!connections[uri]) {
//       const mongoConn = new MongoConnection(uri);
//       mongoConn.close();
//     }
//   });
//   process.exit(0);
// });
