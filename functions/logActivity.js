const { MongoConnection } = require("../database/mongo");
const { getUri } = require("./targetToUri");

module.exports = async function logActivity({
  mongo,
  mongoUri,
  target,
  userId,
  accountId,
  activity,
  data
}) {
  let mongoConn = mongo;
  const uri = getUri(mongoUri, target);
  if (!mongoConn && uri) {
    try {
      mongoConn = new MongoConnection(uri);
    } catch (e) {
      throw new Error("no connection to db!");
    }
  } else {
    throw new Error("connection link to db not defined!");
  }

  return mongoConn.createActivity({ userId, accountId, activity, data });
};
