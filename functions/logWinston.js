const debug = require("debug")("log:winston");
const _ = require("lodash");
/* eslint-disable no-underscore-dangle */
const { createLogger, format, transports } = require("winston");

let globalLogger;
const {
  combine,
  colorize,
  timestamp,
  label,
  printf,
  cli,
  prettyPrint,
  simple
} = format;

function logMeta(data = {}) {
  try {
    const meta = {
      NODE_ENV: process.env.NODE_ENV,
      DEPLOY_VERSION: process.env.DEPLOY_VERSION,
      nameSpace: process.env.__OW_NAMESPACE,
      method: process.env.FUNCTION_METHOD,
      app: process.env.__OW_ACTION_NAME || "OWfunction",
      ...data
    };
    return { metadata: meta };
  } catch (error) {
    console.error("error when trying to build error obj", error);
    return { metadata: data };
  }
}

class Logging {
  constructor() {
    debug("initiate class");
  }

  setup() {
    debug("setup logger ");
    if (globalLogger) {
      debug("reuse existing logger");
      this.logger = globalLogger;
      return this;
    }

    this.logger = createLogger({
      level: "info",
      format: combine(
        format.combine(
          format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
          }),
          format.errors({ stack: true }),
          format.json()
        )
      ),
      exceptionHandlers: [
        new transports.Console({
          level: "info",
          format: cli()
        })
      ],
      transports: [
        new transports.Console({
          level: "info",
          format: cli()
        })
      ]
    });
    globalLogger = this.logger;
    return this;
  }

  add(level, message, data) {
    debug("addLogging %o", { level, message, data });
    this.logger.log(level, message, logMeta(data));
  }
}

exports.Logging = Logging;
