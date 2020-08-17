const Sentry = require("@sentry/node");
const debug = require("debug")("sentryLogging");
const { LogData } = require("./logDNA");

function logError(e, type, request) {
  try {
    LogData((e || {}).message, { type, request }, "error");
    if (
      process.env.NODE_ENV !== "development" &&
      process.env.SENTRY_DNS &&
      typeof process.env.SENTRY_DNS === "string"
    ) {
      Sentry.init({
        release: "serverlessFunction",
        dsn: process.env.SENTRY_DNS
      });

      Sentry.configureScope(scope => {
        scope.setExtra("request", request);
      });

      Sentry.addBreadcrumb({
        category: type,
        level: Sentry.Severity.Info
      });
      Sentry.captureException(e);
    } else {
      console.log("sentry not enabled, set SENTRY_DNS to enable");
      debug(e, type, request);
    }
  } catch (error) {
    console.error("error while loggin error...", error);
  }
  return null;
}

exports.logError = logError;
