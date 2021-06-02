// eslint-disable-next-line import/no-extraneous-dependencies
const { Pool } = require("pg");
const debug = require("debug")("mongo");

let pool = null;

module.exports = class Pg {
  constructor() {
    if (!process.env.POSTGRESS_URI) {
      throw Error("missing POSTGRESS_URI env setting!");
    }
    if (pool === null) {
      console.log("create new postgres connection!");
      pool = new Pool({
        connectionString: process.env.POSTGRESS_URI,
        connectionTimeoutMillis: 2000,
        // idleTimeoutMillis: 10000,
        max: 3,
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      });
    }
    this.pool = pool;
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

  async runQuery(query) {
    let client;
    try {
      debug("run pq %o", query);
      client = await this.pool.connect();
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error executing query", error.stack);
      throw error;
    } finally {
      if (client) await client.release();
    }
  }

  static async close() {
    console.log("pg connections open:", (pool || {}).totalCount || 0);
    if (pool) {
      console.log("close postgres!");
      await pool.end();
    }

    pool = null;
    return true;
  }
};
