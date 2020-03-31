const Sentry = require("@sentry/node");
const debug = require("debug")("sentryLogging");

if (process.env.NODE_ENV !== "development" && !process.env.SENTRY_DNS) {
  console.log("sentry not enabled, set SENTRY_DNS to enable");
}

function logError(e, type, request) {
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
    debug(e, type, request);
  }
  return null;
}

exports.logError = logError;
