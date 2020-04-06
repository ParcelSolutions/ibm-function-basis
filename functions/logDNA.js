/* eslint-disable no-underscore-dangle */
const Logger = require("logdna");

if (!process.env.LOGDNA) {
  console.log("Log DNA not enabled, set LOGDNA to enable");
}

function LogData(message, meta = {}, level = "warn") {
  // console.log("log action", { message, meta, level });
  try {
    if (process.env.LOGDNA) {
      const logger = Logger.createLogger(process.env.LOGDNA, {
        app: process.env.__OW_ACTION_NAME,
        index_meta: true
      });
      meta.NODE_ENV = process.env.NODE_ENV;
      meta.nameSpace = process.env.__OW_NAMESPACE;
      meta.method = process.env.FUNCTION_METHOD;
      const opts = {
        level,
        meta
      };
      logger.log(message, opts);
    }
  } catch (error) {
    console.error(error);
  }

  return true;
}
exports.LogData = LogData;
