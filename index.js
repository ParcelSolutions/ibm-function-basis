const { createdDT, MongoConnection } = require("./database/mongo");
const PG = require("./database/postgress");
const RedisConnection = require("./database/redis");

exports.createdDT = createdDT;
exports.MongoConnection = MongoConnection;
exports.PG = PG;
exports.RedisConnection = RedisConnection;
