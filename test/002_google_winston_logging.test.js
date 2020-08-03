require("dotenv-json")();

const { logger, logMeta } = require("../index");
// logger.info("Hello World", {
//   meta1: 1,
//   meta2: "string",
//   meta3: { deepObj: 1 },
//   NODE_ENV: 'development',
//   nameSpace: undefined,
//   method: undefined,
//   app: 'OWfunction',
//   userId: '2',
//   accountId: '3',
//   target: 'test' 
// });
logger.info("start app");
logger.info("shipment.created", {
  userId: "1",
  accountId: "2",
  target: "test"
});
const meta = logMeta({
  userId: "2",
  accountId: "3",
  target: "test",
  newKey:"error"
})
console.log("meta" , meta)
logger.error("shipment.created", meta);

throw Error("test winston logging");
