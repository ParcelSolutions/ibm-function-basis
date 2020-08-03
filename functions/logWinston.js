
const debug = require("debug")("log:winston");
/* eslint-disable no-underscore-dangle */
const { createLogger, format, transports } = require("winston");

const {
  combine,
  colorize,
  timestamp,
  label,
  printf,
  cli,
  prettyPrint,
  simple,
} = format;
const { WinstonBigQuery } = require("winston-bigquery");
require("winston-mongodb");
// NODE_ENV: process.env.NODE_ENV,
// nameSpace: process.env.__OW_NAMESPACE,
// method: process.env.FUNCTION_METHOD,
// app: process.env.__OW_ACTION_NAME || "OWfunction",

const bqLogSchema = {
  target: "string",
  accountId: "string",
  userId: "string",
  activity: "string",
  NODE_ENV: "string",
  nameSpace: "string",
  method: "string",
  app: "string",
};

function logMeta(data = {}) {
  try {
    const meta = {
      NODE_ENV: process.env.NODE_ENV,
      nameSpace: process.env.__OW_NAMESPACE,
      method: process.env.FUNCTION_METHOD,
      app: process.env.__OW_ACTION_NAME || "OWfunction",
      ...data,
    };
    return meta;
  } catch (error) {
    console.error("error when trying to build error obj", error);
    return data;
  }
}

class Logging {
  constructor() {
    this.logger = null;// we can not set the logger yet (env not set)
  }


  setup() {
    this.logger = createLogger({
      level: "debug",
      format: combine(simple()),
      exceptionHandlers: [
        // new transports.MongoDB({
        //   level: "error",
        //   db: process.env.MONGO_URI_TEST,
        //   collection: "logs.exceptions",
        //   options: { autoReconnect: false },
        //   decolorize: true
        // }),
        new WinstonBigQuery({
          level: "warn",
          create: false,
          schema: bqLogSchema,
          dataset: "logs",
          table: "exceptions",
        }),
        new transports.Console({
          level: "info",
          format: cli(),
        }),
      ],
      transports: [
        // new transports.MongoDB({
        //   db: process.env.MONGO_URI_TEST,
        //   collection: "logs.activity",
        //   options: { autoReconnect: false },
        //   decolorize: true
        // }),
        new WinstonBigQuery({
          level: "info",
          create: false,
          schema: bqLogSchema,
          dataset: "logs",
          table: "activity",
        }),
      ],
    });
  }

  add(level, message, data) {
    debug("addLogging %o", { level, message, data });
    this.logger.log(level, message, logMeta(data));
  }
}

exports.Logging = Logging;

