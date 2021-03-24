/* eslint-disable no-await-in-loop */
const { MongoMemoryServer } = require("mongodb-memory-server");

const { MongoConnection } = require("../database/mongo");
const mongod = new MongoMemoryServer();

async function startMongo() {
  const uri = await mongod.getUri();
  const check = mongod.getInstanceInfo();
  if (!check) throw Error("no db available!");

  return uri;
}

// add documents
const fs = require("fs").promises;

const path = "./transmateSchemas/fixtures/";
async function readDirectory() {
  try {
    const files = await fs.readdir(path);
    return files;

  }
  catch (e) {
    console.warn("no schema/fixtures found!");
    return [];
  }
}

async function readFile(fileName) {

  const rawdata = await fs.readFile(path + fileName);

  return JSON.parse(rawdata);
}

function cleanObject(inObject) {
  if (typeof inObject !== "object" || inObject === null) {
    return inObject; // not an object
  }

  const outObject = Array.isArray(inObject) ? [] : {};

  Object.keys(inObject).forEach(k => {
    let value = inObject[k];
    if (value !== null && typeof value === "object") {
      if (value.$date) {
        // converts date:
        value = new Date(value.$date);
      } else {
        value = cleanObject(value);
      }
    }
    outObject[k] = value;
  });

  return outObject;
}

function cleanFixtureData(fixtures = []) {
  let objects = fixtures;
  if (!Array.isArray(fixtures) && typeof fixtures === "object")
    objects = [fixtures];
  return objects.map(item => cleanObject(item));
}
function collectionMap(fileName) {
  const map = {
    users: {
      collection: "users"
    },
    accounts: {
      collection: "accounts"
    },
    accountSettings: {
      collection: "accounts.settings"
    },
    analysis: {
      collection: "analyses"
    },
    analysisSimulation: {
      collection: "analysis.simulationV2"
    },
    costs: {
      collection: "costs"
    },
    shipments: {
      collection: "shipments"
    },
    shipmentsViews: {
      collection: "shipments.views"
    },
    stages: {
      collection: "stages"
    },
    documents: {
      collection: "documents"
    },
    items: {
      collection: "shipment.items"
    },
    roles: {
      collection: "roles"
    },
    roleAssignments: {
      collection: "role-assignment"
    },
    addresses: {
      collection: "addresses"
    },
    locations: {
      collection: "locations"
    },
    notifications: {
      collection: "notifications"
    },
    priceLists: {
      collection: "price.list"
    },
    priceListRate: {
      collection: "price.list.rate"
    },
    priceRequests: {
      collection: "price.request"
    },
    priceListTemplates: {
      collection: "price.list.template"
    },
    tenders: {
      collection: "tenders"
    },
    tenderDetails: {
      collection: "tenders.details"
    },
    nonConformances: {
      collection: "shipment.nonconformances"
    },
    rates: {
      collection: "rates"
    },

    templates: {
      collection: "templates"
    },
    projects: {
      collection: "shipment.project"
    },
    fuel: {
      collection: "fuel.indexes"
    },
    tasks: {
      collection: "bpmn.tasks"
    },
    accountPortal: {
      collection: "account.portal"
    }
  };
  return (map[fileName] || {}).collection || fileName;
}
async function getCleanDb() {
  const uri = await startMongo();
  process.env.MONGO_URI_DEV = uri;
  process.env.MONGO_URI_TEST = uri;
  process.env.MONGO_URI_LIVE = uri;
  process.env.LOCAL_MONGO = uri;
  const mongo = new MongoConnection(uri);
  console.log("setup connection");
  await mongo.connect();
  console.log("mongo db connection done");
  const files = await readDirectory();
  console.log("files to process in folder", files.length);
  const regexCollection = /data.(.*).json/; // regex to get collection name from file
  for (const file of files) {
    const [, collectionName] = regexCollection.exec(file) || [];

    if (collectionName && collectionMap(collectionName)) {
      const collectionNameMapped = collectionMap(collectionName);
      const data = await readFile(file);
      console.log("insert into ", collectionNameMapped, file);

      await mongo.deleteMany(collectionNameMapped, {});
      await mongo.insertMany(collectionNameMapped, cleanFixtureData(data));
    }
  }

  return uri;
}

// const port = await mongod.getPort();
// const dbPath = await mongod.getDbPath();
// const dbName = await mongod.getDbName();

// some code
//   ... where you may use `uri` for as a connection string for mongodb or mongoose

// you may check instance status, after you got `uri` it must be `true`
// mongod.getInstanceInfo(); // return Object with instance data

// you may stop mongod manually
// await mongod.stop();

// when mongod killed, it's running status should be `false`
// mongod.getInstanceInfo();

// even you forget to stop `mongod` when you exit from script
// special childProcess killer will shutdown it for you

exports.startMongo = startMongo;
exports.getCleanDb = getCleanDb;
