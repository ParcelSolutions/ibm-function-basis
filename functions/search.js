/* eslint-disable no-param-reassign */
const debug = require("debug")("address-checks");

const { to } = require("await-to-js");
const Postgress = require("../database/postgress");

exports.CityNameResults = async search => {
  if (search.length >= 3) {
    const query = `
    SELECT placename, 'postcodes' as type, countrycode, zip as postcode, null as locode  FROM geoname.zipCodes WHERE to_tsvector('english',placename ) @@ to_tsquery('english', '${search}:*')
    union
    SELECT placename, 'postcodes' as type ,countrycode, zip as postcode, null as locode   FROM geoname.geoname_postcodes WHERE to_tsvector('english',placename ) @@ to_tsquery('english', '${search}:*')
    union
    SELECT name, 'airports' as type, iso_country, null as postcode, concat(iso_country,iata_code) as locode  FROM geoname.unloc_airports WHERE to_tsvector('english',name ) @@ to_tsquery('english', '${search}:*') and iata_code is not null
    union
    SELECT u.name, 'seaports' as type, countrycode, null as postcode, concat(countrycode,locationcode) as locode  FROM geoname.unloc as u inner join  geoname.unloc_seaports on concat(countrycode,locationcode)= locode  WHERE to_tsvector('english',u.name ) @@ to_tsquery('english', '${search}:*') 
    ;
    `;

    const pgConnect = new Postgress();
    const [error, results] = await to(pgConnect.runQuery(query));
    if (error) {
      throw error;
    }
    debug("run query %j , results %o", query, results);

    return { results };
  }
  return { results: [] };
};
