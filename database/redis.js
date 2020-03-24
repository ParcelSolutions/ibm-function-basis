const debug = require("debug")("redis");
const redis = require("redis");

const historyDays = 30;
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
});
client.on("error", err => {
  console.error(`Something went wrong with redis ${err}`);
  // throw err;
});

exports.close = () => {
  return new Promise((resolve, reject) => {
    // use the connection to add the key and data , expiry in x (30) day
    client.quit();
    console.log("redis client quit");
    resolve(true);
  });
};

exports.client = () => {
  return client;
};

exports.keepCount = key => {
  return new Promise((resolve, reject) => {
    const dt = new Date();
    const monthHereApi = `${dt.getFullYear()}/${dt.getMonth() + 1}-${key}`;
    client.incr(monthHereApi, (err, count) => {
      if (err) {
        reject(err);
      }
      console.log("---here api calls this month:", count);
      resolve(count);
    });
  });
};
exports.setBuffer = (set, hash, data) => {
  return new Promise((resolve, reject) => {
    // use the connection to add the key and data , expiry in x (30) day
    client.hset(
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
};

// Get words from the database
exports.getBuffer = (set, hash) => {
  return new Promise((resolve, reject) => {
    // use the connection to return us all the documents in the words hash.
    client.hget(set, hash, (err, resp) => {
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
};
