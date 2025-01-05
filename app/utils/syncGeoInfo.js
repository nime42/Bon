var config = require("../../resources/config.js");
var AddressFunctions = require("../AddressFunctions.js");
var AddressSearch = new AddressFunctions(config);

var DBClass = require('../DBClass.js');
var DB = new DBClass('./resources/bon.db');

DB.useAddressLookUp(AddressSearch);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncGeoInfo() {
  const sql = "select * from bons";
  const bonIds = DB.getDbHandler().prepare(sql).all().map(r => (r.id));
  for (let i = 0; i < bonIds.length; i++) {
    let b = bonIds[i];
    console.log("adding geoinfo for bon " + b);
    await sleep(2000);
    DB.addGeoInfo(b);

  }
}

syncGeoInfo();
