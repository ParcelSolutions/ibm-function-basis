const { MongoConnection } = require("../database/mongo");
const PostgresConnection = require("../database/postgress");
const RedisConnection = require("../database/redis");

module.exports = async function closeConnections(mongoUri, pgUri) {
  const mongo = new MongoConnection(mongoUri);
  const pgConnect = new PostgresConnection(pgUri);
  await Promise.all([
    mongo.close(mongoUri),
    pgConnect.close(),
    RedisConnection.close()
  ]);
  console.log("all db connections closed!");
};
