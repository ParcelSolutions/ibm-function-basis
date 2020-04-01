exports.setEnv = (params = {}) => {
  if (params.POSTGRESS_URI || process.env.POSTGRESS_URI)
    process.env.POSTGRESS_URI =
      params.POSTGRESS_URI || process.env.POSTGRESS_URI;

  if (params.MONGO_URI || process.env.MONGO_URI)
    process.env.MONGO_URI = params.MONGO_URI || process.env.MONGO_URI;

  if (params.MONGO_URI_DEV || process.env.MONGO_URI_DEV)
    process.env.MONGO_URI_DEV =
      params.MONGO_URI_DEV || process.env.MONGO_URI_DEV;

  if (params.MONGO_URI_TEST || process.env.MONGO_URI_TEST)
    process.env.MONGO_URI_TEST =
      params.MONGO_URI_TEST || process.env.MONGO_URI_TEST;

  if (params.MONGO_URI_LIVE || process.env.MONGO_URI_LIVE)
    process.env.MONGO_URI_LIVE =
      params.MONGO_URI_LIVE || process.env.MONGO_URI_LIVE;

  if (params.HERE_appId || process.env.HERE_appId)
    process.env.HERE_appId = params.HERE_appId || process.env.HERE_appId;

  if (params.HERE_appCode || process.env.HERE_appCode)
    process.env.HERE_appCode = params.HERE_appCode || process.env.HERE_appCode;

  if (params.GOOGLE_MAPS_API || process.env.GOOGLE_MAPS_API)
    process.env.GOOGLE_MAPS_API =
      params.GOOGLE_MAPS_API || process.env.GOOGLE_MAPS_API;

  if (params.IBM_FUNCTION_KEY || process.env.IBM_FUNCTION_KEY)
    process.env.IBM_FUNCTION_KEY =
      params.IBM_FUNCTION_KEY || process.env.IBM_FUNCTION_KEY;

  if (params.REDIS_URL || process.env.REDIS_URL)
    process.env.REDIS_URL = params.REDIS_URL || process.env.REDIS_URL;

  if (params.JWT_SECRET || process.env.JWT_SECRET)
    process.env.JWT_SECRET = params.JWT_SECRET || process.env.JWT_SECRET;

  if (params.SENTRY_DNS || process.env.SENTRY_DNS)
    process.env.SENTRY_DNS = params.SENTRY_DNS || process.env.SENTRY_DNS;
};
