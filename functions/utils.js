exports.decodeBase64 = body => {
  if (typeof body !== "string")
    throw Error("body should be string when trying this function");
  try {
    const decodedString = Buffer.from(body, "base64").toString("utf8"); // Ta-da
    const obj = JSON.parse(decodedString);
    return obj;
  } catch (error) {
    throw Error("we could not decode the string to an object!");
  }
};
