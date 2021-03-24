const debug = require("debug")("ibm-functions");

const fetch = require("node-fetch").default;

exports.ibmFunctionCall = (url, { apiKey, token }, params) => {
  if (!url || (!apiKey && !token) || !params) {
    debug(
      "WARNING: ibmFunctionCall call is missing some required keys, missing ibm function key or token!"
    );
  }

  function checkStatus(res) {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    }
    debug("wrong status code", res.status);
    res.error = `wrong status code:${res.status}`;
    return res;
  }

  return new Promise(resolve => {
    // use function to cover unique ids (loop) and only build that function once
    let message;
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
      .then(res => {
        message = res;
        return res.json();
      })
      .then(json => {
        debug("body (ibm function answer) : %j , %o", json, message);
        resolve({ ...message, body: json, statusCode: message.status });
      })
      .catch(error => {
        debug("not able to convert to json %o", error);
        resolve({
          ...message,
          statusCode: (message || {}).status || 400,
          error: "not able to convert to json"
        });
      });
  });
};
