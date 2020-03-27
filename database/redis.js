const debug = require("debug")("redis");
const redis = require("redis");

let existingRedisConnection = null;
const historyDays = 30;

module.exports = class RedisConnection {
  constructor() {
    this.client = null;
  }

  connect() {
    if (existingRedisConnection) {
      this.client = existingRedisConnection;
      return existingRedisConnection;
    }
    return new Promise((resolve, reject) => {
      if (!process.env.REDIS_URL) {
        throw Error("env REDIS_URL missing!");
      }
      const client = redis.createClient(process.env.REDIS_URL, {
        tls: {
          rejectUnauthorized: false,
          servername: new URL(process.env.REDIS_URL).hostname
        }
      });
      const redisDB = process.env.NODE_ENV === "production" ? 0 : 1;
      client.select(redisDB, (err, res) => {
        console.log("connect to redis db :#", redisDB);
      });

      client.on("connect", () => {
        console.log("Redis client connected");
        if (process.env.NODE_ENV !== "production") {
          // console.log("delete past keys");
          // client.client.flushdb(function(err, succeeded) {
          //   console.log(succeeded); // will be true if successfull
          // });
        }
        existingRedisConnection = client;
        this.client = client;
        resolve(client);
      });
      client.on("error", err => {
        console.error(`Something went wrong with redis ${err}`);
        reject(err);
        // throw err;
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      // use the connection to add the key and data , expiry in x (30) day
      try {
        this.client.quit();
        existingRedisConnection = null;
        console.log("redis client quit");
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  async client() {
    await this.connect();
    return this.client;
  }

  async keepCount(key) {
    await this.connect();
    return new Promise((resolve, reject) => {
      const dt = new Date();
      const monthHereApi = `${dt.getFullYear()}/${dt.getMonth() + 1}-${key}`;
      this.client.incr(monthHereApi, (err, count) => {
        if (err) {
          reject(err);
        }
        console.log("---here api calls this month:", count);
        resolve(count);
      });
    });
  }

  async setBuffer(set, hash, data) {
    await this.connect();
    return new Promise((resolve, reject) => {
      // use the connection to add the key and data , expiry in x (30) day
      this.client.hset(
        set,
        hash,
        JSON.stringify(data),
        "EX",
        60 * 60 * 24 * historyDays,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve("success");
          }
        }
      );
    });
  }

  async getBuffer(set, hash) {
    await this.connect();
    return new Promise((resolve, reject) => {
      // use the connection to return us all the documents in the words hash.
      this.client.hget(set, hash, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          debug("redis buffer ", resp);
          try {
            resolve(JSON.parse(resp));
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }
};
