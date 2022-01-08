var sqlite3 = require('better-sqlite3');

var path = require('path');
const { debugPort } = require('process');
var db = new sqlite3('./resources/bon.db');
db.pragma("foreign_keys = ON");


function getBons(year,month,callback=console.log) {
    let yearMonth="%";
    if(year!==undefined && month!==undefined) {
      yearMonth=year+"-"+month;
    }

    let sql=`
    select 
      b.id,b.delivery_date,b.status,b.status2,
      a.street_name,a.street_name2,a.street_nr,a.zip_code,a.city,
      c.forename,c.surname,c.email,c.phone_nr,
      co.name,co.ean_nr,
      co_a.street_name as co_street_name,co_a.street_name2 as co_street_name2,co_a.street_nr as co_street_nr,co_a.zip_code as co_zip_code,co_a.city as co_city
    from bons b
     left join addresses a on b.delivery_address_id=a.id
     left join customers c on b.customer_id =c.id
     left join companies co on c.company_id =co.id
     left join addresses co_a on co_a.id=co.address_id
      where strftime('%Y-%m',b.delivery_date) like ? 
    `;

    try {
        const rows=db.prepare(sql).all(yearMonth);

        rows.forEach((r)=> {
          createSubObject(r,"delivery_address",["street_name","street_name2","street_nr","zip_code","city"]);
          createSubObject(r,"customer",["forename","surname","email","phone_nr"]);
          createSubObject(r,"company",["name","ean_nr"]);
          r.customer.company=r.company;delete r.company;
          createSubObject(r,"company_address",["co_street_name","co_street_name2","co_street_nr","co_zip_code","co_city"]);
          r.customer.company.address=r.company_address;delete r.company_address;
          Object.keys(r.customer.company.address).forEach(k=>{
            let newKey=k.replace("co_","");
            r.customer.company.address[newKey]=r.customer.company.address[k];
            delete r.customer.company.address[k];
          });
        });

        callback(true, rows);
    } catch(err) {
        callback(false,err);
    }

}


function delBon(bonId,callback=console.log) {
    var sql="delete from bons where id=?";
    try {
        db.prepare(sql).run(bonId);

        callback(true, null);
    } catch(err) {
        callback(false,err);
    }

}

function createBon(bonData,callback=console.log) {
    bonData.customer_id=createCustomer(bonData.customer);
    bonData.delivery_address_id=createAddress(bonData.delivery_address);
    let sql="INSERT INTO bons(status, status2, customer_id,delivery_address_id, delivery_date, nr_of_servings, info, service_type, payment_type) VALUES(@status, @status2, @customer_id,@delivery_address_id, @delivery_date, @nr_of_servings, @info, @service_type, @payment_type);"
    try {
    const res = db.prepare(sql).run(bonData);
    callback(true,res.lastInsertRowid);
    } catch (err) {
        callback(false,err);
    }

}

function updateBon(id,bonData,callback=console.log) {
  bonData.customer_id=createCustomer(bonData.customer);
  bonData.delivery_address_id=createAddress(bonData.delivery_address);
  let sql=`
  update bons set 
    status=@status, 
    status2=@status2, 
    customer_id=@customer_id,
    delivery_address_id=@delivery_address_id, 
    delivery_date=@delivery_date, 
    nr_of_servings=@nr_of_servings, 
    info=@info, 
    service_type=@service_type, 
    payment_type=@payment_type
  where id=@id;
  `;
  try {
  const res = db.prepare(sql).run(bonData);
  callback(true,bonData.id);
  } catch (err) {
      callback(false,err);
  }

}



function createCustomer(customer) {
    customer.company_id=createCompany(customer.company);
    console.log(customer.company_id);
    let sql=`
    INSERT INTO customers (forename,surname,email,phone_nr,company_id)
    VALUES (@forename, @surname, @email, @phone_nr, @company_id)
    ON CONFLICT (email) DO
    UPDATE SET forename=excluded.forename,surname=excluded.surname,phone_nr=excluded.phone_nr,company_id=excluded.company_id;
    `;

    db.prepare(sql).run(customer);

    sql="select id from customers where email=? COLLATE NOCASE";

    let res=db.prepare(sql).get(customer.email);

    return res.id;
    
}

function createCompany(company) {
  if(company==undefined || company.name==undefined ) {
    return null;
  }
  company.address_id = createAddress(company.address);
  let sql = `
    INSERT INTO companies (name,address_id,ean_nr) VALUES (@name,@address_id,@ean_nr)
    ON CONFLICT (name) DO
    UPDATE SET address_id =excluded.address_id,ean_nr=excluded.ean_nr;`;

  db.prepare(sql).run(company);

  sql="select id from companies where name=? COLLATE NOCASE";

  let res=db.prepare(sql).get(company.name);

  return res.id;

}

function createSubObject(row,mainAttribute,attributes) {
  let s={};
  attributes.forEach(a=>{
    s[a]=row[a];
    delete row[a];
  });
  row[mainAttribute]=s;

}


function createAddress(address) {
  if(address==undefined) {
    return null;
  }
  let sql ="insert into addresses(street_name,street_name2,street_nr,zip_code,city) values(@street_name,@street_name2,@street_nr,@zip_code,@city)";
  try {
    const res = db.prepare(sql).run(address);
    return res.lastInsertRowid;
  } catch (err) {
    if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
      sql ="select id from addresses where street_name=@street_name COLLATE NOCASE and street_name2=@street_name2 COLLATE NOCASE and street_nr=@street_nr COLLATE NOCASE and zip_code=@zip_code COLLATE NOCASE and city=@city COLLATE NOCASE";
      const row = db.prepare(sql).get(address);
      return row.id;
    } else {
        throw err;
    }
  }
}


module.exports={
    getBons:getBons,
    delBon:delBon,
    createBon:createBon,
    updateBon:updateBon
}
