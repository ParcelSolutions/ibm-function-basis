/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

const mongodb = require("mongodb");
const debug = require("debug")("mongo");
const MeteorRandom = require("meteor-random");

let mongoClient = null;
let uniqueIds = [];

module.exports = class MongoConnection {
  constructor() {
    this._initialized = this._initialize();
  }

  async _initialize() {
    // actual async constructor logic
    if (mongoClient === null) {
      mongoClient = await mongodb.MongoClient.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    this.mongoClient = mongoClient;
  }

  db() {
    return this.mongoClient.db();
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
    debug("uniqueIds %o, get 1", uniqueIds.length);
    try {
      if (uniqueIds.length === 0) {
        await this.buildIds();
      }
      return uniqueIds.pop();
    } catch (err) {
      throw err;
    }
  }

  async buildIds(
    qty = 100,
    collections = ["shipments", "stages", "items", "invoices", "invoices.items"]
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

    uniqueIds = ids.filter(id => !forDeletion.includes(id));
    debug("ids %o", uniqueIds);
    return uniqueIds;
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

  async findOne(collection, query, fields) {
    debug("findOne query %j on collection %s", query, collection);
    await this._initialized;
    return new Promise((resolve, reject) => {
      if (!query || !collection) {
        reject(new Error("error collection or query not set"));
      }
      this.mongoClient
        .db()
        .collection(collection)
        .findOne(query, { projection: fields }, (err, r) => {
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
              "1 doc updated, ex update on collection %s, with query %o, obj:  %o",
              collection,
              query,
              update
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
