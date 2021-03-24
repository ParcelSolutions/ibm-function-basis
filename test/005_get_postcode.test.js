/* eslint-disable func-names */
const { expect } = require("chai");

const url = "https://46399a15.eu-de.apigw.appdomain.cloud/transmateapi";
const path = "/importApi";

const debug = require("debug")("test:postcode");

const { ibmFunctionCall } = require("../functions/ibmFunctionCall");

describe("test if cloudcall is till correct on api", function() {
  this.timeout(30000);
  it("gets zip code", async function() {
    const params = {
      env: { accountId: 1, userId: 1, target: "dev" },
      type: "CheckCountryZip",
      request: { countryCode: "BE", zip: "2600" }
    };
    const response = await ibmFunctionCall(
      url + path,
      { apiKey: process.env.IBM_FUNTION_API_KEY },
      params
    );
    debug("result live call %j", response);
    expect(response.statusCode).to.equal(200);
    expect(response.body.result.lat).to.be.a("number");
    expect(response.body.result).to.have.all.keys(
      "countrycode",
      "lat",
      "lng",
      "placename",
      "zip"
    );
  });

  it("without env key", async function() {
    const params = {
      type: "CheckCountryZip",
      request: { countryCode: "BE", zip: "2600" }
    };
    const response = await ibmFunctionCall(
      url + path,
      { apiKey: process.env.IBM_FUNTION_API_KEY },
      params
    );
    debug("result live call %j", response);
    expect(response.statusCode).to.equal(401);
    expect(response.body.error.message).to.equal(
      "Check your authentication keys!"
    );
  });

  it("without db key (depreciating call without db info)", async function() {
    const params = {
      env: { accountId: 1, userId: 1 },
      type: "CheckCountryZip",
      request: { countryCode: "BE", zip: "2600" }
    };
    const response = await ibmFunctionCall(
      url + path,
      { apiKey: process.env.IBM_FUNTION_API_KEY },
      params
    );
    debug("result live call %j", response);
    expect(response.statusCode).to.equal(400);
    expect(response.body.error.message).to.equal(
      "db target not correctly defined!"
    );
  });

  it("with wrong type", async function() {
    const params = {
      env: { accountId: 1, userId: 1, target: "dev" },
      type: "CheckCountryZip_wrong",
      request: { countryCode: "BE", zip: "2600" }
    };
    const response = await ibmFunctionCall(
      url + path,
      { apiKey: process.env.IBM_FUNTION_API_KEY },
      params
    );
    debug("result live call %j", response);
    expect(response.statusCode).to.equal(405);
    expect(response.body.error).to.be.a("object");
  });
});
