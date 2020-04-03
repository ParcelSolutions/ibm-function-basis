# basis for ibm functions

this git contains the basis for an ibm function.

It has connections for DB calls (redis, mongo, postgres) with state keeping of db to avoid reconnections.
Mongo db can keep multiple connections in memeory (dev, test, live).

It also connects with Sentry for error logging.

# development process
- local development
- mocha tests (unit tests)
- push development branch
- do integration tests
- push to staging
- do e2e tests on server functions in staging namespace (integration tests with api calls)
- release (version) to master
- deploy to live namespace

