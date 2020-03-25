exports.setEnv = params => {
  process.env.POSTGRESS_URI = params.POSTGRESS_URI;
  process.env.MONGO_URI_DEV = params.MONGO_URI_DEV;
  process.env.MONGO_URI_TEST = params.MONGO_URI_TEST;
  process.env.MONGO_URI_LIVE = params.MONGO_URI_LIVE;
  process.env.HERE_appId = params.HERE_appId;
  process.env.HERE_appCode = params.HERE_appCode;
  process.env.GOOGLE_MAPS_API = params.GOOGLE_MAPS_API;
  process.env.PARCELSOLUTION_MYSQL_URL = params.PARCELSOLUTION_MYSQL_URL;
  process.env.IBM_FUNCTION_CALC_URL = params.IBM_FUNCTION_CALC_URL;
  process.env.IBM_FUNCTION_KEY = params.IBM_FUNCTION_KEY;
  process.env.REDIS_URL = params.REDIS_URL;
  process.env.JWT_SECRET = params.JWT_SECRET;
};
