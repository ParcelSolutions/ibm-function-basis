/* eslint-disable no-underscore-dangle */
const Logger = require("logdna");

function LogData(message, data, level = "warn") {
  if (!process.env.LOGDNA) {
    console.log("Log DNA not enabled, set LOGDNA to enable");
  }
  // console.log("log action", { message, meta, level });
  try {
    if (process.env.LOGDNA) {
      const meta = {
        NODE_ENV: process.env.NODE_ENV,
        nameSpace: process.env.__OW_NAMESPACE,
        method: process.env.FUNCTION_METHOD,
        app: process.env.__OW_ACTION_NAME || "OWfunction",
        data
      };
      const logger = Logger.createLogger(process.env.LOGDNA, {
        index_meta: true,
        app: meta.app.substring(meta.app.length - 30, meta.app.length),
        tags: ["function", "nodejs"]
      });

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
