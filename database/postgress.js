// eslint-disable-next-line import/no-extraneous-dependencies
const { Pool } = require("pg");
const debug = require("debug")("pg");

const pgConnection = {};

module.exports = class Pg {
  constructor(uri = process.env.POSTGRESS_URI) {
    debug("connect to uri %s connection %o", uri, pgConnection[uri]);
    this.uri = uri;
    if (!uri) {
      throw Error("missing POSTGRESS URI!");
    }
    if (!pgConnection[uri]) {
      debug("create new postgres connection!");
      this.pool = new Pool({
        connectionString: uri,
        
        connectionTimeoutMillis: 2000,
        // idleTimeoutMillis: 10000,
        max: 3,
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      });
      pgConnection[uri] = this.pool;
    } else {
      this.pool = pgConnection[uri];
    }
  }

  async testPgConnection() {
    let client;
    try {
      client = await this.pool.connect();
      const result = await client.query("SELECT NOW()");
      return result.rows[0];
    } catch (error) {
      console.error("Error executing query", error.stack);
      throw error;
    } finally {
      if (client) await client.release();
    }
  }

  async runQuery(query, replace) {
    let client;
    try {
      debug("run pq %o", query);
      client = await this.pool.connect();
      const result = await client.query(query, replace);
      return result.rows;
    } catch (error) {
      console.error("Error executing query", error.stack);
      throw error;
    } finally {
      if (client) await client.release();
    }
  }

  async close() {
    console.log("pg connections open:", (this.pool || {}).totalCount || 0);
    if (this.pool) {
      console.log("close postgres!");
      await this.pool.end();
    }

    pgConnection[this.uri] = null;
    return true;
  }
};
