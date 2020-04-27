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
        // idleTimeoutMillis: 10000,
        ssl: true,
        max: 3
      });
    }
    this.pool = pool;
  }

  testPgConnection() {
    return this.pool
      .query("SELECT NOW()")
      .then(res => ((res || {}).rows || [])[0])
      .catch(err => {
        console.error("Error executing query", err.stack);
        throw err;
      });
  }

  runQuery(query) {
    return this.pool
      .query(query)
      .then(res => res.rows)
      .catch(err => {
        console.error("Error executing query", err.stack);
        throw err;
      });
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
