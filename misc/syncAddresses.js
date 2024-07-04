var config = require("../resources/config.js");
var AddressFunctions = require("../app/AddressFunctions.js");
var AddressSearch = new AddressFunctions(config);

var sqlite3 = require("better-sqlite3");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCoordFromMaster(address, masterDb) {
  if (!masterDb) {
    return null;
  }
  let sql =
    "select lat,lon from addresses where street_name=@street_name COLLATE NOCASE and street_name2=@street_name2 COLLATE NOCASE and street_nr=@street_nr COLLATE NOCASE and zip_code=@zip_code COLLATE NOCASE and city=@city COLLATE NOCASE";
  const row = masterDb.prepare(sql).get(address);
  return row;
}

function updateAddress(adr, coord,db) {
  console.log(`updating ${adr.street_name} ${adr.street_nr} ${adr.zip_code} ${adr.city} (id=${adr.id}) with ${JSON.stringify(coord)}`);
  let {lat,lon}=coord;
  let sql="update addresses set lat=?,lon=? where id=?";
  const res = db.prepare(sql).run(lat,lon,adr.id);

}

async function main(args) {
  if (args.length < 1) {
    console.log("Usage: syncAddresses bon-db-file [master-db-file]");
    return;
  }
  let dbFile = args[0];
  let dbMasterFile = args[1];
  let db = new sqlite3(dbFile);
  db.pragma("foreign_keys = ON");
  let dbMaster;
  if (dbMasterFile) {
    dbMaster = new sqlite3(dbMasterFile);
    dbMaster.pragma("foreign_keys = ON");
  }

  let sql = "SELECT * FROM addresses WHERE lat IS null AND street_name<>''";
  const rows = db.prepare(sql).all();

  for (let i = 0; i < rows.length; i++) {
    let adr = rows[i];
    let coord = getCoordFromMaster(adr, dbMaster);

    if (coord) {
      updateAddress(adr, coord,db);
      continue;
    } else {
      AddressSearch.findCoordinates(adr, (status, coordinates) => {
        if (status) {
          updateAddress(adr, coordinates,db);
        } else {
            console.log( `failed to update ${adr.street_name} ${adr.street_nr} ${adr.zip_code} ${adr.city} (id=${adr.id})`)
        }
      });
    }
    await sleep(2000);
  }
}

var args = process.argv.slice(2);

main(args);
