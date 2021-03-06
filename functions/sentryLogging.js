const Sentry = require("@sentry/node");
const debug = require("debug")("sentryLogging");

async function logError(e, type, request) {
  try {
    if (
      process.env.NODE_ENV !== "development" &&
      process.env.SENTRY_DNS &&
      typeof process.env.SENTRY_DNS === "string"
    ) {
      debug("set dns :%o", process.env.SENTRY_DNS);
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
      await Sentry.flush(2000);
    } else {
      debug("sentry not enabled, set SENTRY_DNS to enable");
    }
  } catch (error) {
    console.error("error while loggin error...", error);
  }
  return true;
}

exports.logError = logError;
