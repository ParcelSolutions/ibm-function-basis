const debug = require("debug")("decodebase64");

exports.decodeBase64 = body => {
  if (typeof body !== "string")
    throw Error("body should be string when trying this function");
  try {
    const decodedString = Buffer.from(body, "base64").toString("utf8"); // Ta-da
    debug("decodedString", decodedString);
    // remove new lines and tabs if needed for badly formated json
    // decodedString = decodedString.replace(/(\r\n|\n|\r)/gm, " ");
    // debug("cleaned", decodedString);
    const obj = JSON.parse(decodedString);
    return obj;
  } catch (error) {
    throw Error("we could not decode the string to an object!");
  }
};

exports.checkAllParams = object => {
  // console.log("object values:", Object.values(object));
  const hasEmptyKey = Object.values(object).some(
    x => x == null || (typeof x !== "string" && typeof x !== "number")
  );
  if (hasEmptyKey) {
    throw Error(
      `we should have values for each of the keys:${JSON.stringify(
        Object.keys(object)
      )}`
    );
  }
};

exports.numberToString = number => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const pos = number % 25;
  return letters[Math.round(pos)];
};
