var config = require("../../resources/config.js");
var AddressFunctions = require("../AddressFunctions.js");
var AddressSearch = new AddressFunctions(config);

var DBClass=require('../DBClass.js');
var DB=new DBClass('./resources/bon.db');

DB.useAddressLookUp(AddressSearch);

const sql="select * from bons where delivery_date >date('now')";
const bonIds=DB.getDbHandler().prepare(sql).all().map(r=>(r.id));
bonIds.forEach(b=>{
    DB.addGeoInfo(b);
})
