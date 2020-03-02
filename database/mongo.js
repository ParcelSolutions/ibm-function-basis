/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

const { MongoClient } = require("mongodb");
const debug = require("debug")(__filename.slice(__dirname.length + 1, -3));
const MeteorRandom = require("meteor-random");
const { to } = require("await-to-js");

const mongoConnection = {};
const uniqueIds = {};

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
    if (!uri && typeof uri === "string") {
      throw Error("uri should always be set!");
    }
    try {
      this.mongoClient = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        sslValidate: false
      });

      this.uri = uri;
      // this._initialized = this._initialize();
    } catch (e) {
      console.error(e);
      throw e;
    }
    // if (!this.mongoClient || !this.connect()) {
    //   throw Error("not able to create connection to mongo!");
    // }
  }

  async connect() {
    // actual async constructor logic
    let connection = null;
    if (!mongoConnection[this.uri]) {
      debug("setup connection with ", this.uri);
      let error;
      [error, connection] = await to(this.mongoClient.connect());
      mongoConnection[this.uri] = connection;
      if (error) {
        debug("issue with db connnection", error);
        throw error;
      }
      if (!connection) {
        throw Error("not able to connect to db!");
      }
    } else {
      debug("connection exists !");
      connection = mongoConnection[this.uri];
    }
    return connection;
  }

  async db() {
    try {
      const conn = await this.connect();
      if (!conn) throw Error("no db connection!");
      return conn.db();
    } catch (e) {
      throw e;
    }
  }

  async close() {
    if (mongoConnection[this.uri]) {
      console.log("mongoclient exists, lets close it!");
      try {
        const conn = await this.connect();
        if (!conn) throw Error("no db connection!");
        await conn.close();
        mongoConnection[this.uri] = null;
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

    uniqueIds[this.uri] = ids.filter(id => !forDeletion.includes(id));
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
    array = array.map(obj => {
      if (!obj.created) {
        obj.created = createdDT("function");
      }
      return obj;
    });
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!array || !array.length > 0) {
        reject(new Error("error collection , array not set"));
      }
      conn
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
    const [error, conn] = await to(this.connect());
    if (error) throw error;
    return new Promise((resolve, reject) => {
      if (!obj) {
        reject(new Error("error collection , obj not set"));
      }
      if (!obj.created) {
        obj.created = createdDT("function");
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
