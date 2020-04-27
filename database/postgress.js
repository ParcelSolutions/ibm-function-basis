// eslint-disable-next-line import/no-extraneous-dependencies
const { Pool } = require("pg");

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
    try {
      const client = await this.pool.connect();
      const result = await client.query("SELECT NOW()");
      client.release();
      return result.rows[0];
    } catch (error) {
      console.error("Error executing query", error.stack);
      throw error;
    }
  }

  async runQuery(query) {
    try {
      const client = await this.pool.connect();
      const result = await client.query(query);
      client.release();
      return result.rows;
    } catch (error) {
      console.error("Error executing query", error.stack);
      throw error;
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
