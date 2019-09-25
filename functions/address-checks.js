/* eslint-disable no-param-reassign */
const debug = require("debug")("address-checks");
const NodeGeocoder = require("node-geocoder");
const postcode = require("postcode-validator");
const { to } = require("await-to-js");
const Postgress = require("../database/postgress");

const options = {
  provider: "here",
  // apiKey: process.env.GOOGLE_KEY, // for Mapquest, OpenCage, Google Premier
  appId: process.env.HERE_appId, // for here
  appCode: process.env.HERE_appCode, // for here
  language: "en" // for here
};
const geocoder = NodeGeocoder(options);

debug("geoname-postcode  module loaded");

async function CheckCountryCodes(countryCodes) {
  if (countryCodes.length > 0) {
    const countryList = `'${countryCodes.join("','")}'`;
    let caseSelect = "CASE ";
    countryCodes.forEach(countryCode => {
      caseSelect += `WHEN iso = '${countryCode}' OR iso3= '${countryCode}' THEN '${countryCode}' `;
    });
    caseSelect += " END as input ";
    const query = `SELECT iso , ${caseSelect} FROM geoname.country  WHERE iso IN (${countryList}) OR iso3 IN (${countryList});`;
    debug("run query %j", query);
    const pgConnect = new Postgress();
    const [error, results] = await to(pgConnect.runQuery(query));
    if (error) {
      throw error;
    }
    debug("run query %j , results %o", query, results);

    return results;
  }
  return [];
}
function StringToAZ09(string) {
  return (string.toUpperCase().match(/[0-9A-Z]/g) || []).join("");
}
async function GetAlternativeCityNames(cityNames) {
  if (cityNames.length > 0) {
    let caseSelect = "CASE ";
    cityNames.forEach(cityName => {
      caseSelect += `WHEN to_tsvector('english', alternatenames) @@ to_tsquery('english', '${cityName} | ${StringToAZ09(
        cityName
      )}' ) THEN '${cityName}' `;
    });
    const cityNamesConverted = [];
    cityNames.forEach(cityName =>
      cityNamesConverted.push(cityName, StringToAZ09(cityName))
    );
    caseSelect += " END as input ";
    const query = `SELECT name , ${caseSelect} FROM geoname.geoname WHERE to_tsvector('english', alternatenames) @@ to_tsquery('english', '${cityNamesConverted.join(
      "|"
    )}')`;

    debug("run query %j", query);
    const pgConnect = new Postgress();
    const [error, results] = await to(pgConnect.runQuery(query));
    if (error) {
      throw error;
    }
    debug("run query %j , results %o", query, results);

    return results;
  }
  return [];
}
async function CheckCityNames(cityNames) {
  if (cityNames.length > 0) {
    let caseSelect = "CASE ";
    cityNames.forEach(cityName => {
      caseSelect += `WHEN to_tsvector('english', alternatenames) @@ to_tsquery('english', '${cityName} | ${StringToAZ09(
        cityName
      )}' ) THEN '${cityName}' `;
    });
    const cityNamesConverted = [];
    cityNames.forEach(cityName =>
      cityNamesConverted.push(cityName, StringToAZ09(cityName))
    );
    caseSelect += " END as input ";
    const query = `SELECT name , ${caseSelect} FROM geoname.geoname WHERE to_tsvector('english', alternatenames) @@ to_tsquery('english', '${cityNamesConverted.join(
      "|"
    )}')`;

    debug("run query %j", query);
    const pgConnect = new Postgress();
    const [error, results] = await to(pgConnect.runQuery(query));
    if (error) {
      throw error;
    }
    debug("run query %j , results %o", query, results);

    return results;
  }
  return [];
}
async function CheckZips(zips) {
  if (zips.length > 0) {
    const alfanumericZips = zips.map(zip => StringToAZ09(zip));
    let caseSelect = "CASE ";
    zips.forEach(zip => {
      caseSelect += `WHEN zip_alphanumeric = '${StringToAZ09(
        zip
      )}' THEN '${zip}' `;
    });
    caseSelect += " END as input ";
    // create index CREATE INDEX postcodesTextSearch ON geoname_postcodes USING GIN (to_tsvector('english', zip));
    const query = `SELECT countrycode, zip, zip_alphanumeric, zip_digit,  ${caseSelect} FROM geoname.geoname_postcodes_normalised
                  where zip_alphanumeric IN ('${alfanumericZips.join(
                    "','"
                  )}') ;`;

    debug("run query %j", query);
    const pgConnect = new Postgress();
    const [error, results] = await to(pgConnect.runQuery(query));
    if (error) {
      throw error;
    }
    debug("run query %j , results %o", query, results);

    return results;
  }
  return [];
}
async function CheckSeaPorts(ports) {
  if (ports.length > 0) {
    let caseSelect = "CASE ";
    ports.forEach(port => {
      caseSelect += `WHEN locode = '${port}' THEN '${port}' `;
    });
    caseSelect += " END as input ";
    const query = `SELECT   ${caseSelect} FROM geoname.unloc_seaports
                  where locode IN ('${ports.join("','")}') ;`;

    const pgConnect = new Postgress();
    const [error, results] = await to(pgConnect.runQuery(query));
    if (error) {
      throw error;
    }
    debug("run query %j , results %o", query, results);
    return results;
  }
  return [];
}

async function CheckAirports(ports) {
  if (ports.length > 0) {
    let caseSelect = "CASE ";
    ports.forEach(port => {
      caseSelect += `WHEN iata_code = '${port}' THEN '${port}' `;
    });
    caseSelect += " END as input ";
    const query = `SELECT ${caseSelect} FROM geoname.unloc_airports 
                  where iata_code IN ('${ports.join("','")}') ;`;

    const pgConnect = new Postgress();
    const [error, results] = await to(pgConnect.runQuery(query));
    if (error) {
      throw error;
    }
    debug("run query %j , results %o", query, results);

    return results;
  }
  return [];
}

async function GetZips(countryCodesVerified, cityNamesVerified) {
  const query = `SELECT countrycode, zip FROM geoname.geoname_postcodes where to_tsvector('english', placename) @@ to_tsquery('english', '${cityNamesVerified.join(
    "|"
  )}') AND countrycode IN ('${countryCodesVerified.join("','")}') ;`;

  const pgConnect = new Postgress();
  const [error, results] = await to(pgConnect.runQuery(query));
  if (error) {
    throw error;
  }
  debug("run query %j , results %o", query, results);

  return results;
}

exports.splitInput = async input => {
  const requestArray = input.split(",");
  const countryCodes = [];
  const zipCodes = [];
  const cityNames = [];
  const seaPorts = [];
  const airports = [];
  debug("requestArray %o", requestArray);
  requestArray.forEach(request => {
    request = request.trim();
    const requestUppercase = request.toUpperCase() || "";

    if (requestUppercase.length === 2 && StringToAZ09(request).length === 2) {
      debug("can be iso2 countryCode %o", request);
      countryCodes.push(requestUppercase);
    } else if (StringToAZ09(request).length > 2) {
      if (requestUppercase.length === 3 && StringToAZ09(request).length === 3) {
        debug("can be iso3 countryCode %o", request);
        countryCodes.push(requestUppercase);
        airports.push(requestUppercase);
      }
      if (request.length === 5) seaPorts.push(request);
      zipCodes.push(request);
      cityNames.push(request);
    }
  });

  let [
    error,
    [
      countryCodesVerified,
      cityNamesVerified,
      zipCodesVerified,
      seaPortsVerified,
      airportsVerified
    ]
  ] = await to(
    Promise.all([
      CheckCountryCodes(countryCodes),
      CheckCityNames(cityNames),
      CheckZips(zipCodes),
      CheckSeaPorts(seaPorts),
      CheckAirports(airports)
    ])
  );
  if (error) {
    throw error;
  }

  return {
    input,
    requestArray,
    countryCodes,
    countryCodesVerified,
    cityNames,
    cityNamesVerified,
    zipCodes,
    zipCodesVerified,
    seaPorts,
    seaPortsVerified,
    airports,
    airportsVerified
  };
};

exports.bestMatch = async obj => {
  const { countryCodesVerified, cityNames, cityNamesVerified } = obj;
  const [error, zipCodeResults] = await to(
    GetZips(
      countryCodesVerified.map(result => result.iso),
      cityNames.concat(cityNamesVerified.map(result => result.name))
    )
  );

  const range = {
    CC: zipCodeResults.map(result => result.countrycode).shift(),
    from:
      zipCodeResults
        .map(result => result.zip)
        .shift()
        .substring(0, 2) + "00000000",
    to:
      zipCodeResults
        .map(result => result.zip)
        .pop()
        .substring(0, 2) + "ZZZZZZZZ"
  };
  console.log(range);
  if (error) {
    throw error;
  }
};

exports.CheckCountryZip = async (
  countryCode,
  zip,
  placeName,
  lat,
  lng,
  accuracy
) => {
  const pgConnect = new Postgress();
  let error;
  let result = {};
  let query = "";
  zip = (zip || "").toUpperCase().trim();
  debug("zip :", zip);
  countryCode = countryCode.toUpperCase().trim();
  lat = parseFloat(lat) || null;
  lng = parseFloat(lng) || null;
  debug("check if zip and country are passing regex test: %o", {
    zip,
    countryCode
  });
  const returnObj = {};
  returnObj.request = {
    zip,
    placeName,
    countryCode,
    lat,
    lng,
    accuracy
  };
  // check if postcode and country are valid , stop if not!
  // switch GB to UK for validator
  let postcodeTest;
  try {
    postcodeTest = postcode.validate(
      zip,
      countryCode === "GB" ? "UK" : countryCode
    );
  } catch (e) {
    if (countryCode !== "IE") {
      throw new Error(`not a valid countryCode code used: ${countryCode} `);
    }
    // IE not in postcode validator for now
    // all IE zips allowed
  }
  if (!postcodeTest) {
    throw new Error(
      `${zip} is not a valid zip  for  countryCode ${countryCode}`
    );
  }

  debug("current obj: %o", returnObj);
  // obj is complete, insert for future use!
  if (typeof lat === "number" && typeof lng === "number" && placeName) {
    debug("create countryCode-zip with ");
    // placename, lat and lng given, we can save this one
    query = `
      INSERT INTO geoname.geoname_postcodes (countrycode, zip, placename, lat, lng, accuracy)
      SELECT '${countryCode}','${zip}','${placeName}',${lat},${lng},'${accuracy}'
      FROM geoname.geoname_postcodes
      WHERE NOT EXISTS
          (SELECT 1
          FROM geoname.geoname_postcodes
          WHERE lower(countrycode)=lower('${countryCode}')
            AND lower(zip)=lower('${zip}') );
    `;
    [error, result] = await to(pgConnect.runQuery(query));
    if (error) return error;
    // return request as result
    returnObj.result = Object.assign({}, returnObj.request);
    return returnObj;
  }
  debug("find countryCode-zip with obj");
  query = `
      SELECT countrycode, zip, placename, lat, lng
      FROM geoname.geoname_postcodes
      WHERE lower(countrycode)=lower('${countryCode}')
            AND lower(zip)=lower('${zip}') ;
    `;
  [error, result] = await to(pgConnect.runQuery(query));
  if (error) return error;
  if (result && result.length > 0 && result[0] !== null) {
    debug("zip found in db: %o", result);

    // overwrite keys with new data
    [returnObj.result] = result;
    returnObj.result.lat = parseFloat(returnObj.result.lat);
    returnObj.result.lng = parseFloat(returnObj.result.lng);
    return returnObj;
  }
  debug(" findOne no result,  error (if any) : %o", error);
  if (placeName === null || typeof placeName !== "string") {
    debug("no place name so no geocoder lookup");

    throw new Error(
      `no db result and no placename given for lookup: ${zip},${countryCode}`
    );
  }
  const inputLookup = `${zip},${placeName},${countryCode}`;
  debug("geocoder lookup for : %o", inputLookup);
  [error, result] = await to(
    geocoder.geocode({
      address: inputLookup,
      country: countryCode
    })
  );
  if (error) {
    debug("error with google geocoder %o", error);

    throw new Error(
      `GEOCODER could not validate zip countryCode: ${zip},${countryCode} details : ${JSON.stringify(
        error
      )}`
    );
  }

  debug("geocoder result %o ", result);
  if (
    Array.isArray(result) &&
    result.length > 0 &&
    result[0].city &&
    result[0].zipcode === zip
  ) {
    returnObj.result = {
      countryCode: result[0].countryCode,
      placeName: result[0].city,
      zip: result[0].zipcode,
      lat: result[0].latitude,
      lng: result[0].longitude,
      accuracy: 1
    };
  } else if (
    Array.isArray(result) &&
    result.length > 0 &&
    (result[0].zipcode === zip || result[0].zipcode == null) &&
    result[0].formattedAddress &&
    result[0].city &&
    result[0].formattedAddress.toLowerCase().includes(placeName.toLowerCase())
  ) {
    // city part of formatted string, let's accept this one to.
    returnObj.result = {
      countryCode: result[0].countryCode,
      placeName: result[0].city,
      zip: result[0].zipcode == null ? zip : result[0].zipcode,
      lat: result[0].latitude,
      lng: result[0].longitude,
      accuracy: result[0].zipcode == null ? 3 : 2
    };
  }
  if (returnObj.result) {
    query = `
          INSERT INTO geoname.geoname_postcodes (countrycode, zip, placename, lat, lng, accuracy)
          VALUES ('${returnObj.result.countryCode}','${returnObj.result.zip}','${returnObj.result.placeName}',${returnObj.result.lat},${returnObj.result.lng},'${returnObj.result.accuracy}') ;`;
    [error, result] = await to(pgConnect.runQuery(query));
    if (error) return error;
    return returnObj;
  }

  debug("no result from geocoder");

  throw new Error(
    `GEOCODER could not return a valid obj for: ${zip},${countryCode}${JSON.stringify(
      result
    )}`
  );
};
