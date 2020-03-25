const { createdDT, MongoConnection } = require("./database/mongo");
const PG = require("./database/postgress");

exports.createdDT = createdDT;
exports.MongoConnection = MongoConnection;
exports.PG = PG;
