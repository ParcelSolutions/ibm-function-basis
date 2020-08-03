exports.getUri = function getUri(uri, target) {
  if (uri && typeof uri === "string") {
    return uri;
  }
  let dbUri = null;
  if (target === "test") {
    dbUri = process.env.MONGO_URI_TEST;
  } else if (target === "live") {
    dbUri = process.env.MONGO_URI_LIVE;
  } else if (target === "dev") {
    dbUri = process.env.MONGO_URI_DEV;
  }
  return dbUri;
};
