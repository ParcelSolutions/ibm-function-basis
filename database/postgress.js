const debug = require("debug")(__filename.slice(__dirname.length + 1, -3));
// eslint-disable-next-line import/no-extraneous-dependencies
const { Pool } = require("pg");
// const { types } = require("pg");
// convert numeric to number in js (from text in result pg)
// types.setTypeParser(1700, "text", parseFloat);
let pool = null;

module.exports = class Pg {
  constructor() {
    if (pool === null) {
      pool = new Pool({
        connectionString: process.env.POSTGRESS_URI,
        ssl: true
      });
    }
    this.pool = pool;
  }

  testPgConnection() {
    return this.pool
      .query("SELECT NOW()")
      .then(res => res.rows[0])
      .catch(err => err.stack);
  }

  runQuery(query) {
    debug("run this postgress query %s", query);
    return this.pool
      .query(query)
      .then(res => res.rows)
      .catch(err => err.stack);
  }
};
