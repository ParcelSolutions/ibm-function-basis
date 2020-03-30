const Sentry = require("@sentry/node");

if (process.env.NODE_ENV !== "development" && !process.env.SENTRY_DNS) {
  console.log("sentry not enabled, set SENTRY_DNS to enable");
}

if (process.env.NODE_ENV !== "development" && process.env.SENTRY_DNS) {
  Sentry.init({
    release: "serverlessFunction",
    dsn: process.env.SENTRY_DNS
  });
}
function logError(e, type, request) {
  Sentry.configureScope(scope => {
    scope.setExtra("request", request);
  });

  Sentry.addBreadcrumb({
    category: type,
    level: Sentry.Severity.Info
  });
  Sentry.captureException(e);
  return null;
}

exports.logError = logError;
