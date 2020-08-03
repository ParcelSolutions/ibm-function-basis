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
logger.info("test1", {
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

logger.error("test2", meta);
try{
  logger.error("test3", meta);
  throw Error("test4 error throw");
}catch(e){
  logger.error("test4", e);
}
//throw Error("test5 winston logging");
