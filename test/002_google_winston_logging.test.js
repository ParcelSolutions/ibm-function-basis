require("dotenv-json")();

const {  Logging } = require("../index");
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
const logger = new Logging()
logger.setup()
logger.add("info","start app");
logger.add("info","test1", {
  userId: "1",
  accountId: "2",
  target: "test"
});


logger.add("debug","test2", {});
try{
  logger.add("warn","test3");
  throw Error("test4 error throw");
}catch(e){

  logger.add("error","test4", {error:e.stack});
}
throw Error("test5 winston logging");
