require("dotenv-json")();

const {  addLogging } = require("../index");
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
addLogging("info","start app");
addLogging("info","test1", {
  userId: "1",
  accountId: "2",
  target: "test"
});


addLogging("debug","test2", {});
try{
  addLogging("warn","test3");
  throw Error("test4 error throw");
}catch(e){

  addLogging("error","test4", {error:e.stack});
}
throw Error("test5 winston logging");
