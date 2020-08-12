const { MongoConnection } = require("../database/mongo");
const PostgresConnection = require("../database/postgress");
const RedisConnection = require("../database/redis");

module.exports = async function closeConnections(mongoUri) {
  const mongo = new MongoConnection(mongoUri);

  await Promise.all([
    mongo.close(mongoUri),
    PostgresConnection.close(),
    RedisConnection.close()
  ]);
  console.log("all db connections closed!");
};
