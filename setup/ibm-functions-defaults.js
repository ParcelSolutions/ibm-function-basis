const functionList = [
  {
    types: ["exchangeRates"],
    url:
      "https://eu-de.functions.cloud.ibm.com/api/v1/web/TransmateOrg_live/getMissingExchangeRates/getMissingExchangeRates.json",
    localFunction: null
  },
  {
    types: ["sendGridWebhook"],
    path: "/sendGridWebhook",
    localFunction: "sendGridWebhook.js"
  },
  {
    types: ["confirmNumidiaRate"],
    path: "/numidiaSoap",
    localFunction: "numidiaSoap.js"
  },
  {
    types: ["seaDistances", "leadtime"],
    path: "/seaDistance",
    localFunction: "seaDistance.js"
  },
  {
    types: ["excelPriceList"],
    path: "/excelPriceList",
    localFunction: "excelPriceList.js"
  },
  {
    types: ["CreateShipmentInvoiceCost", "CheckAddress", "CheckCountryZip"],
    path: "/importApi",
    localFunction: "importsApi.js"
  },
  {
    types: ["Simulate", "simulate", "simulateRate"],
    path: "/simulateRate",
    localFunction: "simulateRate.js"
  },

  {
    types: [
      "runStartAnalysisWorker",
      "runPriceLookup",
      "runShipPriceLookup",
      "runPriceRequestSummary",
      "runPriceRequestBuildItems",
      "runPriceLookupAnalysisWorker",
      "runSummarizeShipmentsWorker",
      "runScopeAggregationWorker"
    ],
    path: "/rateCalculation",
    localFunction: "transmate-calculations.js"
  },
  {
    types: [
      "tenderifyMap",
      "tenderifyReadFile",
      "tenderifyUnifiedpricelist",
      "tenderifyWritePricelist"
    ],
    path: "autoMapPricelists",
    localFunction: "autoMapPricelists.js"
  },
  {
    types: ["exactApi"],
    path: "exact/api",
    localFunction: null
  },
  {
    types: ["startWorkflow"],
    url:
      "https://eu-de.functions.cloud.ibm.com/api/v1/web/TransmateOrg_live/default/workflow.json",
    localFunction: null
  }
];

exports.getCloudUrl = type => {
  const functionParams = functionList.find(el => el.types.includes(type));
  if (!functionParams) throw Error(`missing serverless function type: ${type}`);
  if (!process.env.transmate_function_url)
    throw Error(`missing transmate_function_url!`);
  // default to main ibm function url, default to empty path (if url is given.)
  const {
    url = process.env.transmate_function_url,
    path = ""
  } = functionParams;
  return url + path;
};
