const { MongoConnection } = require("../database/mongo");
const PostgresConnection = require("../database/postgress");
const RedisConnection = require("../database/redis");

module.exports = async function closeConnections(mongoUri) {
  await MongoConnection.close(mongoUri);
  await PostgresConnection.endPgPool();
  await RedisConnection.close();
};
