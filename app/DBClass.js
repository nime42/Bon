

module.exports = class DB {
  constructor(dbFile) {
    var sqlite3 = require("better-sqlite3");
    this.db = new sqlite3(dbFile);
    this.db.pragma("foreign_keys = ON");
  }

  useAddressLookUp(addressFunctionsObj) {
    this.addressLookupFunctions = addressFunctionsObj;
  }

  getDbHandler() {
    return this.db;
  }

  getBons(year, month, callback = console.log) {
    let yearMonth = "%";
    if (year !== undefined && month !== undefined) {
      yearMonth = year + "-" + month;
    }

    let sql = `
        select 
          b.id,b.delivery_date,b.pickup_time,b.status,b.status2,b.nr_of_servings,b.customer_info,b.invoice_info,b.kitchen_info,b.delivery_info,b.price_category,b.payment_type,b.kitchen_selects,b.customer_collects,
          a.street_name,a.street_name2,a.street_nr,a.zip_code,a.city,a.lat,a.lon,
          c.forename,c.surname,c.email,c.phone_nr,
          co.name,co.ean_nr,
          co_a.street_name as co_street_name,co_a.street_name2 as co_street_name2,co_a.street_nr as co_street_nr,co_a.zip_code as co_zip_code,co_a.city as co_city,co_a.lat as co_lat,co_a.lon as co_lon
        from bons b
         left join addresses a on b.delivery_address_id=a.id
         left join customers c on b.customer_id =c.id
         left join companies co on c.company_id =co.id
         left join addresses co_a on co_a.id=co.address_id
          where strftime('%Y-%m',datetime(b.delivery_date,'localtime')) like ? 
        `;

    try {
      const rows = this.db.prepare(sql).all(yearMonth);

      rows.forEach((r) => {
        this.createSubObject(r, "delivery_address", ["street_name", "street_name2", "street_nr", "zip_code", "city","lat","lon"]);
        this.createSubObject(r, "customer", ["forename", "surname", "email", "phone_nr"]);
        this.createSubObject(r, "company", ["name", "ean_nr"]);
        r.customer.company = r.company;
        delete r.company;
        this.createSubObject(r, "company_address", ["co_street_name", "co_street_name2", "co_street_nr", "co_zip_code", "co_city","co_lat","co_lon"], ["street_name", "street_name2", "street_nr", "zip_code", "city","lat","lon"]);
        r.customer.company.address = r.company_address;
        delete r.company_address;
      });

      callback(true, rows);
    } catch (err) {
      callback(false, err);
    }
  }

  getBonSummary(bonId) {
    let sql = `
    with boninfo as (select 
      b.id,b.delivery_date,b.pickup_time,b.status,b.nr_of_servings,
      b.price_category,b.payment_type,
      b.kitchen_selects,b.customer_collects,
      b.invoice_date,
      case b.customer_collects 
      when true then ''
      else trim(a.street_name2||' '||a.street_name||' '||a.street_nr||', '||a.zip_code||' '||a.city) end as delivery_adr,
      a.street_name2,
      a.street_name,
      a.street_nr,
      a.zip_code,
      a.city,
      c.forename ||' '||c.surname as name,
      c.email,c.phone_nr,
      co.name as company,co.ean_nr,
      o.quantity * o.price as price,
      o.quantity * o.cost_price cost_price
    from bons b
     left join addresses a on b.delivery_address_id=a.id
     left join customers c on b.customer_id =c.id
     left join companies co on c.company_id =co.id
     left join addresses co_a on co_a.id=co.address_id
     left join orders o on b.id=o.bon_id)
    select id,delivery_date,pickup_time,status ,nr_of_servings,price_category,payment_type,kitchen_selects,customer_collects,delivery_adr,street_name2,street_name,street_nr,zip_code,city,name,email,phone_nr,company,ean_nr,sum(price) as price,sum(cost_price) as cost_price,invoice_date from boninfo
    where coalesce(?,id)=id
    group by id order by id desc
    `;

    return this.db.prepare(sql).all(bonId);
  }

  getBonsJoinedWithOrders(bonId) {
    let sql = `
        with all_bons as (
            with boninfo as (select 
                  b.id,b.delivery_date,pickup_time,b.status,b.nr_of_servings,
                  b.price_category,b.payment_type,
                  b.kitchen_selects,b.customer_collects,
                  b.invoice_date,
                  case b.customer_collects 
                  when true then ''
                  else trim(a.street_name2||' '||a.street_name||' '||a.street_nr||', '||a.zip_code||' '||a.city) end as delivery_adr,
                  a.street_name2,
                  a.street_name,
                  a.street_nr,
                  a.zip_code,
                  a.city,
                  c.forename ||' '||c.surname as name,
                  c.email,c.phone_nr,
                  co.name as company,co.ean_nr,
                  o.quantity * o.price as price,
                  o.quantity * o.cost_price cost_price
                from bons b
                 left join addresses a on b.delivery_address_id=a.id
                 left join customers c on b.customer_id =c.id
                 left join companies co on c.company_id =co.id
                 left join addresses co_a on co_a.id=co.address_id
                 left join orders o on b.id=o.bon_id)
                select id,delivery_date,pickup_time,status ,nr_of_servings,price_category,payment_type,kitchen_selects,customer_collects,delivery_adr,street_name2,street_name,street_nr,zip_code,city,name,email,phone_nr,company,ean_nr,coalesce(sum(price),0) as total_price,coalesce(sum(cost_price),0) as total_cost_price,invoice_date from boninfo
                group by id 
            ),
            all_orders as (
            select o.bon_id,coalesce(i.name,ip.name) as name,coalesce(i.category,ip.category) as category,o.*,i.external_id from orders o 
                    left join items i on o.item_id=i.id
                    left join (select *,'izettle' as category from izettle_products) ip on o.izettle_product_id = ip.id
                    
            )
            select b.*,coalesce(o.category,'') as product_category,coalesce(o.name,'') as product,coalesce(o.quantity,0) as quantity,coalesce(o.price,0) as product_price,coalesce(o.cost_price,0) as product_cost_price,o.special_request from all_bons b
            left join all_orders o on b.id=o.bon_id
            where coalesce(?,b.id)=b.id
                order by id desc 
        `;
    return this.db.prepare(sql).all(bonId);
  }

  searchBons(searchParams, includeOrders, callback = console.log) {
    let statuses = ["new", "needInfo", "approved", "preparing", "done", "delivered", "invoiced","payed", "closed", "offer"];
    let statusSearchConstr;
    if (searchParams.status) {
      let elems = [];
      searchParams.status.split(",").forEach((s) => {
        let elem = s.trim();
        if (statuses.indexOf(elem) >= 0) {
          elems.push(elem);
        } else {
          throw "Unknown status:" + elem;
        }
      });
      statusSearchConstr = "b.status in ('" + elems.join("','") + "')";
    } else {
      statusSearchConstr = "1=1";
    }

    ["bonId", "status", "status2", "afterDate", "beforeDate"].forEach((p) => {
      if (!searchParams[p]) {
        searchParams[p] = null;
      }
    });
    let sql = `
      select 
        b.id,b.delivery_date,pickup_time,b.status,b.status2,b.nr_of_servings,b.customer_info,b.service_type,b.invoice_info,b.kitchen_info,b.delivery_info,b.price_category,b.payment_type,b.kitchen_selects,b.customer_collects,b.invoice_date,
        a.street_name,a.street_name2,a.street_nr,a.zip_code,a.city,a.lat,a.lon,
        c.forename,c.surname,c.email,c.phone_nr,
        co.name,co.ean_nr,
        co_a.street_name as co_street_name,co_a.street_name2 as co_street_name2,co_a.street_nr as co_street_nr,co_a.zip_code as co_zip_code,co_a.city as co_city,co_a.lat as co_lat,co_a.lon as co_lon
      from bons b
       left join addresses a on b.delivery_address_id=a.id
       left join customers c on b.customer_id =c.id
       left join companies co on c.company_id =co.id
       left join addresses co_a on co_a.id=co.address_id
       where b.id=ifnull(@bonId,b.id) and ${statusSearchConstr} and b.status2=ifnull(@status2,b.status2)
        and date(b.delivery_date,'localtime')>=ifnull(@afterDate,date(b.delivery_date,'-1 day','localtime')) and date(b.delivery_date,'localtime')<=ifnull(@beforeDate,date(b.delivery_date,'localtime'))
      order by coalesce(b.pickup_time,b.delivery_date)
      `;

    try {
      const rows = this.db.prepare(sql).all(searchParams);

      rows.forEach((r) => {
        this.createSubObject(r, "delivery_address", ["street_name", "street_name2", "street_nr", "zip_code", "city","lat","lon"]);
        this.createSubObject(r, "customer", ["forename", "surname", "email", "phone_nr"]);
        this.createSubObject(r, "company", ["name", "ean_nr"]);
        r.customer.company = r.company;
        delete r.company;
        this.createSubObject(r, "company_address", ["co_street_name", "co_street_name2", "co_street_nr", "co_zip_code", "co_city","co_lat","co_lon"], ["street_name", "street_name2", "street_nr", "zip_code", "city","lat","lon"]);
        r.customer.company.address = r.company_address;
        delete r.company_address;
        if (includeOrders) {
          r.orders = this.getOrders(r.id);
        }
      });

      if (callback === null) {
        return rows;
      } else {
        callback(true, rows);
      }
    } catch (err) {
      if (callback === null) {
        throw err;
      } else {
        callback(false, err);
      }
    }
  }

  delBon(bonId, callback = console.log) {
    var sql = "delete from bons where id=?";
    try {
      this.db.prepare(sql).run(bonId);

      if (callback === null) {
        return true;
      } else {
        callback(true, null);
      }
    } catch (err) {
      if (callback === null) {
        throw err;
      } else {
        callback(false, err);
      }
    }
  }

  /**
   * Create and store a bon in DB
   * @param {*} bonData
   * @param {*} callback fun(status,bonId)
   *                      status {boolean} true if all went ok,fals otherways
   *                      bonId {integer} the new bon-id or an error object if status is false.
   * @returns bonId {integer} (if callback=null)
   */
  createBon(bonData, callback = console.log) {
    bonData.customer_id = this.createCustomer(bonData.customer);
    bonData.delivery_address_id = this.createAddress(bonData.delivery_address);
    //OBS!!!!! Don't forget to add new columns as attributes in BonUtils.getEmptyBon
    let sql =
      "INSERT INTO bons(status, status2,customer_info, customer_id,delivery_address_id, delivery_date,pickup_time, nr_of_servings,kitchen_selects,customer_collects, kitchen_info,delivery_info, service_type, payment_type,price_category,invoice_info) VALUES(@status, @status2,@customer_info, @customer_id,@delivery_address_id, @delivery_date,@pickup_time, @nr_of_servings,@kitchen_selects,@customer_collects, @kitchen_info,@delivery_info, @service_type, @payment_type,@price_category,@invoice_info);";
    try {
      const res = this.db.prepare(sql).run(bonData);
      let newBonId = res.lastInsertRowid;
      this.saveOrders(newBonId, bonData.orders);

      this.updateInvoiceDate(newBonId, bonData.status);

      if (callback === null) {
        return newBonId;
      } else {
        callback(true, newBonId);
      }
    } catch (err) {
      if (callback === null) {
        throw err;
      } else {
        callback(false, err);
      }
    }
  }

  updateBon(id, bonData, callback = console.log) {
    bonData.customer_id = this.createCustomer(bonData.customer);
    bonData.delivery_address_id = this.createAddress(bonData.delivery_address);
    this.updateInvoiceDate(id, bonData.status);
    let sql = `
      update bons set 
        status=@status, 
        status2=@status2, 
        customer_id=@customer_id,
        delivery_address_id=@delivery_address_id, 
        delivery_date=@delivery_date, 
        pickup_time=@pickup_time, 
        nr_of_servings=@nr_of_servings,
        kitchen_selects=@kitchen_selects,
        customer_collects=@customer_collects,
        customer_info=@customer_info, 
        invoice_info=@invoice_info, 
        kitchen_info=@kitchen_info, 
        delivery_info=@delivery_info, 

        service_type=@service_type, 
        payment_type=@payment_type,
        price_category=@price_category
      where id=@id;
      `;
    try {
      const res = this.db.prepare(sql).run(bonData);
      this.saveOrders(id, bonData.orders);
      callback(true, bonData.id);
    } catch (err) {
      callback(false, err);
    }
  }

patchBon(bonId,patches,callback) {

  let columnLookUp={};
  this.db.pragma("table_info(bons)").forEach(c=>{columnLookUp[c.name.toLowerCase()]=true;});
  let assignments=[];
  let columns=Object.keys(patches);
  for(let i=0;i<columns.length;i++) {
    let col=columns[i].toLowerCase();
    if(columnLookUp[col]!==true) {
      callback(false,`${col} is not a column in table bon`);
      return;
    }
    assignments.push(`${col}=@${columns[i]}`);
  }
  let sql=`update bons set ${assignments.join(",")} where id=@id`;
  try {
    this.db.prepare(sql).run({...patches,id:bonId});
    if (callback === null) {
      return true;
    } else {
      callback(true, "ok");
    }
  } catch(err) {
    if (callback === null) {
      throw err;
    } else {
      callback(false, err);
    }
  }

}


  updateInvoiceDate(bonId, newStatus) {
    if (newStatus === "invoiced") {
      let sql = "select * from bons where id=?";
      const row = this.db.prepare(sql).get(bonId);
      if (row.status !== newStatus || row.invoice_date === null) {
        sql = "update bons set invoice_date=datetime('now') where id=?";
        const res = this.db.prepare(sql).run(bonId);
      }
    }
  }

  getCustomers(email, callback = console.log) {
    let searchEmail = "%";
    if (email !== undefined) {
      searchEmail = email + "%";
    }
    let sql = `
        select 
          c.forename,c.surname,c.email,c.phone_nr,
          co.name,co.ean_nr,
          co_a.street_name as co_street_name,co_a.street_name2 as co_street_name2,co_a.street_nr as co_street_nr,co_a.zip_code as co_zip_code,co_a.city as co_city
        from customers c
        left join companies co on c.company_id =co.id
        left join addresses co_a on co_a.id=co.address_id
        where c.email like ? COLLATE NOCASE
      `;

    try {
      const rows = this.db.prepare(sql).all(searchEmail);

      rows.forEach((r) => {
        this.createSubObject(r, "company", ["name", "ean_nr"]);
        this.createSubObject(r, "company_address", ["co_street_name", "co_street_name2", "co_street_nr", "co_zip_code", "co_city"], ["street_name", "street_name2", "street_nr", "zip_code", "city"]);
        r.company.address = r.company_address;
        delete r.company_address;
      });
      callback(true, rows);
    } catch (err) {
      callback(false, err);
    }
  }

  createCustomer(customer) {

    if(!customer.email) {
      return null;
    }

    customer.company_id = this.createCompany(customer.company);
    let sql = `
        INSERT INTO customers (forename,surname,email,phone_nr,company_id)
        VALUES (@forename, @surname, @email, @phone_nr, @company_id)
        ON CONFLICT (email) DO
        UPDATE SET forename=excluded.forename,surname=excluded.surname,phone_nr=excluded.phone_nr,company_id=excluded.company_id;
        `;

    this.db.prepare(sql).run(customer);

    sql = "select id from customers where email=? COLLATE NOCASE";

    let res = this.db.prepare(sql).get(customer.email);

    return res.id;
  }

  createCompany(company) {
    if (company == undefined || !company.name) {
      return null;
    }
    company.address_id = this.createAddress(company.address);
    let sql = `
        INSERT INTO companies (name,address_id,ean_nr) VALUES (@name,@address_id,@ean_nr)
        ON CONFLICT (name) DO
        UPDATE SET address_id =excluded.address_id,ean_nr=excluded.ean_nr;`;

    this.db.prepare(sql).run(company);

    sql = "select id from companies where name=? COLLATE NOCASE";

    let res = this.db.prepare(sql).get(company.name);

    return res.id;
  }

  createSubObject(row, mainAttribute, attributeNames, newAttributeNames) {
    let s = {};
    attributeNames.forEach((_, i) => {
      let attr = attributeNames[i];
      let newAttr = newAttributeNames ? newAttributeNames[i] : attr;
      s[newAttr] = row[attr];
      delete row[attr];
    });
    row[mainAttribute] = s;
  }

  createAddress(address) {
    if (address == undefined || !address.street_name) {
      return null;
    }

    let sql = "insert into addresses(street_name,street_name2,street_nr,zip_code,city) values(@street_name,@street_name2,@street_nr,@zip_code,@city)";
    try {
      const res = this.db.prepare(sql).run(address);
      this.addCoordinatesToAdressId(res.lastInsertRowid);
      return res.lastInsertRowid;
    } catch (err) {
      if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
        sql =
          "select id from addresses where street_name=@street_name COLLATE NOCASE and street_name2=@street_name2 COLLATE NOCASE and street_nr=@street_nr COLLATE NOCASE and zip_code=@zip_code COLLATE NOCASE and city=@city COLLATE NOCASE";
        const row = this.db.prepare(sql).get(address);
        return row.id;
      } else {
        throw err;
      }
    }
  }

  addCoordinatesToAdressId(id) {
    if (this.addressLookupFunctions) {
      let sql = "select * from addresses where id=?";
      const address = this.db.prepare(sql).get(id);
      if (address) {
        this.addressLookupFunctions.findCoordinates(address, (status, coordinates) => {
            if(status) {
                let {lat,lon}=coordinates;
                let sql="update addresses set lat=?,lon=? where id=?";
                const res = this.db.prepare(sql).run(lat,lon,id);
            }
        });
      }
    }
  }

  getItems(callback = console.log) {
    let sql = "SELECT * FROM items order by category is null,category,name is null,name;";
    try {
      const rows = this.db.prepare(sql).all();

      if (callback === null) {
        return rows;
      } else {
        callback(true, rows);
      }
    } catch (err) {
      if (callback === null) {
        throw err;
      } else {
        callback(false, err);
      }
    }
  }

  updateItems(items, callback = console.log) {
    let sql = `
      INSERT INTO items (name,category,cost_price,sellable,external_id) VALUES (@name,@category,@calculated_price,@sellable,@external_id)
      ON CONFLICT (external_id) DO
      UPDATE SET cost_price=ifnull(excluded.cost_price,cost_price),sellable=ifnull(excluded.sellable,sellable),name=ifnull(excluded.name,name),category=ifnull(excluded.category,category) 
      `;

    try {
      this.db.transaction(() => {
        let ps = this.db.prepare(sql);
        items.forEach((i) => {
          ps.run(i);
        });

        sql = "select id,category,name from items";
        let itemTable = {};
        this.db
          .prepare(sql)
          .all()
          .forEach((r) => {
            itemTable[r.category + "," + r.name] = r.id;
          });

        sql = `
          INSERT INTO salesprice_categories(item_id,price_category,price) VALUES (?,?,?)
          ON CONFLICT (item_id,price_category) DO
          UPDATE SET price=ifnull(excluded.price,price) 
          `;

        ps = this.db.prepare(sql);
        items.forEach((i) => {
          let item_id = itemTable[i.category + "," + i.name];
          i.salesPrices &&
            Object.keys(i.salesPrices).forEach((k) => {
              ps.run(item_id, k, i.salesPrices[k]);
            });
        });
        callback(true);
      })();
    } catch (err) {
      callback(false, err);
    }
  }

  deleteItems(id, callback = console.log) {
    if (id === "*") {
      id = "%";
    }
    let sql = "delete from items where id like ?";
    try {
      this.db.prepare(sql).run(id);
      if (id === "%") {
        this.db.prepare("UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='items'").run();
      }
      callback(true, null);
    } catch (err) {
      callback(false, err);
    }
  }

  getItemPrices(callback = console.log) {
    let sql = `
      select i.id,i.name,i.category,i.cost_price,p.price_categories from items i
      join (select item_id,group_concat(price_category||'='||coalesce(price,0),';') as price_categories from salesprice_categories group by item_id ) p on i.id=p.item_id  
      `;
    try {
      let categoryNames = {};
      const rows = this.db
        .prepare(sql)
        .all()
        .map((r) => {
          let row = {
            id: r.id,
            name: r.name,
            category: r.category,
            cost_price: r.cost_price,
          };
          let price_categories = {};
          r.price_categories.split(";").forEach((c) => {
            let [k, p] = c.split("=");
            price_categories[k] = p;
            categoryNames[k] = 1;
          });
          row.price_categories = price_categories;
          return row;
        });
      callback(true, { items: rows, categoryNames: Object.keys(categoryNames) });
    } catch (err) {
      callback(false, err);
    }
  }

  saveOrders(bonId, orders) {
    let sql = "delete from orders where bon_id=?";
    this.db.prepare(sql).run(bonId);
    let sortOrder = 0;
    let preparedOrders = orders.map((o) => {
      o.bon_id = bonId;
      o.id = o.id == "null" ? null : o.id;
      o.izettle_product_id = o.izettle_product_id == "null" ? null : o.izettle_product_id;
      o.sorting_order = sortOrder++;
      return o;
    });

    sql = `insert into orders(bon_id,item_id,price,cost_price,quantity,special_request,izettle_product_id,sorting_order) 
            values(@bon_id,@id,@price,@cost_price,@quantity,@comment,@izettle_product_id,@sorting_order)`;

    let ps = this.db.prepare(sql);
    preparedOrders.forEach((o) => {
      ps.run(o);
    });
  }

  getOrders(bonId, callback) {
    let sql = `select coalesce(i.name,ip.name) as name,coalesce(i.category,ip.category) as category,o.*,i.external_id from orders o 
        left join items i on o.item_id=i.id
        left join (select *,'izettle' as category from izettle_products) ip on o.izettle_product_id = ip.id
        where bon_id=coalesce(?,bon_id) order by sorting_order`;

    try {
      const rows = this.db.prepare(sql).all(bonId);
      if (callback) {
        callback(true, rows);
      } else {
        return rows;
      }
    } catch (err) {
      if (callback) {
        callback(false, err);
      } else {
        throw err;
      }
    }
  }

  updateBonStatus(id, status, callback = console.log) {
    let sql = "update bons set status=? where id=?";
    try {
      this.db.prepare(sql).run(status, id);
      callback(true);
    } catch (err) {
      callback(false, err);
    }
  }

  getMessages(callback = console.log) {
    let sql = "SELECT * FROM messages order by coalesce(sortorder,'Z'),id";
    try {
      const rows = this.db.prepare(sql).all();
      callback(true, rows);
    } catch (err) {
      callback(false, err);
    }
  }

  getMessage(name) {
    let sql = "SELECT * FROM messages WHERE name=?";
    const row = this.db.prepare(sql).get(name);
    return row;
  }

  createMessage(message, callback = console.log) {
    let sql = "INSERT INTO messages(name,message,sortorder) values(?,?,?)";
    try {
      const res = this.db.prepare(sql).run(message.name, message.message, message.sortorder);
      message.id = res.lastInsertRowid;
      callback(true, message);
    } catch (err) {
      callback(false, err.code);
    }
  }

  updateMessages(id, message, callback = console.log) {
    let sql = "update messages set name=?,message=?,sortorder=? where id=?";
    try {
      this.db.prepare(sql).run(message.name, message.message, message.sortorder, id);
      callback(true);
    } catch (err) {
      callback(false, err);
    }
  }

  deleteMessage(id, callback = console.log) {
    var sql = "delete from messages where id=?";
    try {
      this.db.prepare(sql).run(id);

      callback(true, null);
    } catch (err) {
      callback(false, err);
    }
  }

  getNotifiedBon(userId, callback = console.log) {
    let sql = "select bon_id,message from notified_bons b where user_id<>? and not exists (select null from notified_bons where bon_id=b.bon_id and user_id=?) order by notify_date limit 1";
    let res = this.db.prepare(sql).get(userId, userId);
    if (res) {
      callback(true, res);
    } else {
      callback(false);
    }
  }

  seeBon(userId, bonId, callback = console.log) {
    let sql = "insert into notified_bons(user_id,bon_id) values(?,?) on conflict(user_id,bon_id) DO NOTHING";
    this.db.prepare(sql).run(userId, bonId);
    callback(true);
  }

  notifyBon(userId, bonId, message, callback = console.log) {
    let sql = "delete from notified_bons where bon_id=? and user_id<>?";
    this.db.prepare(sql).run(bonId, userId);
    sql = "insert into notified_bons(user_id,bon_id,message) values(?,?,?) on conflict(user_id,bon_id) DO UPDATE set message=?";
    this.db.prepare(sql).run(userId, bonId, message, message);
    callback(true);
  }

  complementWithGrocyIds(orders, callback = console.log) {
    let grocySql = "select external_id from items where id=?";
    let grocyStmt = this.db.prepare(grocySql);
    let izettleSQl = "select i.external_id from izettle_products iz join items i on iz.grocy_item_id =i.id where iz.id=?";
    let izettleStmt = this.db.prepare(izettleSQl);

    orders.forEach((o) => {
      if (o.id != null && o.id != "") {
        let row = grocyStmt.get(o.id);
        o.external_id = row?.external_id;
      } else if (o.izettle_product_id != null && o.izettle_product_id != "") {
        let row = izettleStmt.get(o.izettle_product_id);
        o.external_id = row?.external_id;
      }
    });
    callback(true, orders);
  }

  getLastOrderByCustomer(mailAddress) {
    let sql = `
    SELECT b.* FROM bons b
      JOIN customers c ON b.customer_id =c.id 
      WHERE c.email = ?
      ORDER BY b.delivery_date DESC LIMIT 1
    `;

    let res = this.db.prepare(sql).get(mailAddress);
    if (res) {
      let [bon]=this.getBonSummary(res.id);
      return bon;
    } else {
      return undefined;
    }

  }

};