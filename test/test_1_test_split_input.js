/* eslint-disable func-names */
const { assert } = require("chai");
const debug = require("debug")("test:split");
const Postgress = require("../database/postgress");
// gets the global main function

const addressChecks = require("../functions/address-checks.js");

// setup index pg

describe("main-schema", function() {
  it("test if port works", async function() {
    this.timeout(10000);
    //create index if does not exist, don't read result.
    const pgConnect = new Postgress();

    try {
      // await pgConnect.runQuery(
      //   "CREATE INDEX postcodesTextSearch ON geoname.geoname_postcodes USING GIN (to_tsvector('english', zip));"
      // );
      await pgConnect.runQuery(
        "CREATE INDEX alternatenamesTextSearch ON geoname.geoname USING GIN (to_tsvector('english', alternatenames));"
      );
      await pgConnect.runQuery(
        "CREATE INDEX placenameGeoname ON geoname.geoname_postcodes USING GIN (to_tsvector('english', placename));"
      );
      await pgConnect.runQuery(
        "CREATE INDEX placenameZipCodes ON geoname.zipcodes USING GIN (to_tsvector('english', placename));"
      );
      await pgConnect.runQuery(
        "CREATE INDEX nameUnloc ON geoname.unloc USING GIN (to_tsvector('english', name));"
      );
      await pgConnect.runQuery(
        "CREATE INDEX nameAirports ON geoname.unloc_airports USING GIN (to_tsvector('english', name));"
      );

      console.log("index build successfull...");
    } catch (error) {
      console.log("index build not successfull...", error);
    }

    // test existing post code
    const result = await addressChecks.splitInput("BEANR");
    debug("result split : %j", result);
    // assert.isArray(result.costs, 'costs is not an array');
    assert.isObject(result, "did not return object");
  });
  it("test zip and cc work", async function() {
    // test existing post code
    const result = await addressChecks.splitInput("BE,9900");
    debug("result split : %j", result);
    // assert.isArray(result.costs, 'costs is not an array');
    assert.isObject(result, "did not return object");
  });
  it("test city and cc work", async function() {
    // test existing post code
    const result = await addressChecks.splitInput("BE,Eeklo");
    debug("result split : %j", result);
    // assert.isArray(result.costs, 'costs is not an array');
    assert.isObject(result, "did not return object");
  });
});
