const Logger = require("logdna");

if (!process.env.LOGDNA) {
  console.log("Log DNA not enabled, set LOGDNA to enable");
}

function LogData(message, meta = {}, level = "warn") {
  // console.log("log action", { message, meta, level });
  if (process.env.LOGDNA) {
    const logger = Logger.createLogger(process.env.LOGDNA, {
      app: `${process.env.__OW_NAMESPACE}/${process.env.__OW_ACTION_NAME}`,
      index_meta: true
    });
    meta.NODE_ENV = process.env.NODE_ENV;
    meta.method = process.env.FUNCTION_METHOD;
    const opts = {
      level,
      meta
    };
    logger.log(message, opts);
  }
  return true;
}
exports.LogData = LogData;
