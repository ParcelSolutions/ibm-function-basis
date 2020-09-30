const debug = require("debug")("ibm-functions");

const fetch = require("node-fetch").default;

exports.ibmFunctionCall = (url, { apiKey, token }, params) => {
  if (!url || (!apiKey && !token) || !params) {
    console.log(
      "WARNING: ibmFunctionCall call is missing some required keys, missing ibm function key or token!"
    );
  }

  function checkStatus(res) {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    }
    console.error(Error(`wrong status code:${res.status}`));
    return res;
  }

  return new Promise((resolve, reject) => {
    // use function to cover unique ids (loop) and only build that function once

    fetch(url, {
      method: "POST",
      headers: {
        apiKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify(params)
    })
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        debug("body (ibm function answer) : %j", json);
        resolve({ statusCode: 200, body: json });
      })
      .catch(error => {
        debug("not able to convert to json %o", error);
        resolve({ statusCode: 400, error });
      });
  });
};
