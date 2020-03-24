const Sentry = require("@sentry/node");

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    release: "FUNCTIONNAME@1.0",
    dsn: "https://e17259a66abc42618cfcc95ca89cc882@sentry.io/2627328"
  });
}
function logError(e) {
  Sentry.captureException(e);
  return null;
}

exports.logError = logError;
