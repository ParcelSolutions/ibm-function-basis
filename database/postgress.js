// eslint-disable-next-line import/no-extraneous-dependencies
const { Pool } = require("pg");

let pool = null;

module.exports = class Pg {
  constructor() {
    if (pool === null) {
      console.log("create new postgres connection!");
      pool = new Pool({
        connectionString: process.env.POSTGRESS_URI,
        // idleTimeoutMillis: 10000,
        ssl: true,
        max: 5
      });
    }
    this.pool = pool;
  }

  testPgConnection() {
    return this.pool
      .query("SELECT NOW()")
      .then(res => res.rows[0])
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

  async endPgPool() {
    console.log("pg connections open:", this.pool.totalCount);
    this.pool.end().then(() => {
      console.log("PG pool has ended");
      console.log(
        "pg connections open after close event:",
        this.pool.totalCount
      );
      return true;
    });
  }
};
