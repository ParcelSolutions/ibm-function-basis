require("dotenv-json")();

const { logger } = require("../index");

logger.info("start app");
logger.info("shipment.created", {
  userId: "1",
  accountId: "2",
  target: "test"
});
logger.info("shipment.created", {
  meta: "meta",
  accountId: "2",
  target: "test"
});
throw Error("test winston logging");
