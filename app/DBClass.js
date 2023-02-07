

module.exports = class DB {
    constructor(dbFile) {
        var sqlite3 = require("better-sqlite3");
        this.db= new sqlite3(dbFile);
        this.db.pragma("foreign_keys = ON");
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
          b.id,b.delivery_date,b.status,b.status2,b.nr_of_servings,b.customer_info,b.kitchen_info,b.price_category,b.payment_type,b.kitchen_selects,b.customer_collects,
          a.street_name,a.street_name2,a.street_nr,a.zip_code,a.city,
          c.forename,c.surname,c.email,c.phone_nr,
          co.name,co.ean_nr,
          co_a.street_name as co_street_name,co_a.street_name2 as co_street_name2,co_a.street_nr as co_street_nr,co_a.zip_code as co_zip_code,co_a.city as co_city
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
                this.createSubObject(r, "delivery_address", [
                    "street_name",
                    "street_name2",
                    "street_nr",
                    "zip_code",
                    "city",
                ]);
                this.createSubObject(r, "customer", [
                    "forename",
                    "surname",
                    "email",
                    "phone_nr",
                ]);
                this.createSubObject(r, "company", ["name", "ean_nr"]);
                r.customer.company = r.company;
                delete r.company;
                this.createSubObject(
                    r,
                    "company_address",
                    [
                        "co_street_name",
                        "co_street_name2",
                        "co_street_nr",
                        "co_zip_code",
                        "co_city",
                    ],
                    ["street_name", "street_name2", "street_nr", "zip_code", "city"]
                );
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
      b.id,b.delivery_date,b.status,b.nr_of_servings,
      b.price_category,b.payment_type,
      b.kitchen_selects,b.customer_collects,
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
    select id,delivery_date,status ,nr_of_servings,price_category,payment_type,kitchen_selects,customer_collects,delivery_adr,street_name2,street_name,street_nr,zip_code,city,name,email,phone_nr,company,ean_nr,sum(price) as price,sum(cost_price) as cost_price from boninfo
    where coalesce(?,id)=id
    group by id order by id desc
    `;

        return this.db.prepare(sql).all(bonId);


    }

    searchBons(searchParams, includeOrders, callback = console.log) {

        let statuses = ['new', 'needInfo', 'approved', 'preparing', 'done', 'delivered', 'invoiced', 'offer'];
        let statusSearchConstr;
        if (searchParams.status) {
            let elems = [];
            searchParams.status.split(",").forEach(s => {
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

        ["bonId", "status", "status2", "afterDate", "beforeDate"].forEach(p => {
            if (!searchParams[p]) {
                searchParams[p] = null;
            }
        })
        let sql = `
      select 
        b.id,b.delivery_date,b.status,b.status2,b.nr_of_servings,b.customer_info,b.kitchen_info,b.price_category,b.payment_type,b.kitchen_selects,b.customer_collects,
        a.street_name,a.street_name2,a.street_nr,a.zip_code,a.city,
        c.forename,c.surname,c.email,c.phone_nr,
        co.name,co.ean_nr,
        co_a.street_name as co_street_name,co_a.street_name2 as co_street_name2,co_a.street_nr as co_street_nr,co_a.zip_code as co_zip_code,co_a.city as co_city
      from bons b
       left join addresses a on b.delivery_address_id=a.id
       left join customers c on b.customer_id =c.id
       left join companies co on c.company_id =co.id
       left join addresses co_a on co_a.id=co.address_id
       where b.id=ifnull(@bonId,b.id) and ${statusSearchConstr} and b.status2=ifnull(@status2,b.status2)
        and date(b.delivery_date)>=ifnull(@afterDate,date(b.delivery_date,'-1 day')) and date(b.delivery_date)<=ifnull(@beforeDate,date(b.delivery_date))
      order by b.delivery_date
      `;

        try {
            const rows = this.db.prepare(sql).all(searchParams);

            rows.forEach((r) => {
                this.createSubObject(r, "delivery_address", [
                    "street_name",
                    "street_name2",
                    "street_nr",
                    "zip_code",
                    "city",
                ]);
                this.createSubObject(r, "customer", [
                    "forename",
                    "surname",
                    "email",
                    "phone_nr",
                ]);
                this.createSubObject(r, "company", ["name", "ean_nr"]);
                r.customer.company = r.company;
                delete r.company;
                this.createSubObject(
                    r,
                    "company_address",
                    [
                        "co_street_name",
                        "co_street_name2",
                        "co_street_nr",
                        "co_zip_code",
                        "co_city",
                    ],
                    ["street_name", "street_name2", "street_nr", "zip_code", "city"]
                );
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

            callback(true, null);
        } catch (err) {
            callback(false, err);
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
        let sql =
            "INSERT INTO bons(status, status2,customer_info, customer_id,delivery_address_id, delivery_date, nr_of_servings,kitchen_selects,customer_collects, kitchen_info, service_type, payment_type,price_category) VALUES(@status, @status2,@customer_info, @customer_id,@delivery_address_id, @delivery_date, @nr_of_servings,@kitchen_selects,@customer_collects, @kitchen_info, @service_type, @payment_type,@price_category);";
        try {
            const res = this.db.prepare(sql).run(bonData);
            let newBonId = res.lastInsertRowid;
            this.saveOrders(newBonId, bonData.orders);

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
        let sql = `
      update bons set 
        status=@status, 
        status2=@status2, 
        customer_id=@customer_id,
        delivery_address_id=@delivery_address_id, 
        delivery_date=@delivery_date, 
        nr_of_servings=@nr_of_servings,
        kitchen_selects=@kitchen_selects,
        customer_collects=@customer_collects,
        customer_info=@customer_info, 
        kitchen_info=@kitchen_info, 
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
                this.createSubObject(
                    r,
                    "company_address",
                    [
                        "co_street_name",
                        "co_street_name2",
                        "co_street_nr",
                        "co_zip_code",
                        "co_city",
                    ],
                    ["street_name", "street_name2", "street_nr", "zip_code", "city"]
                );
                r.company.address = r.company_address;
                delete r.company_address;
            });
            callback(true, rows);
        } catch (err) {
            callback(false, err);
        }
    }

    createCustomer(customer) {
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
        if (company == undefined || company.name == undefined) {
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

    createSubObject(
        row,
        mainAttribute,
        attributeNames,
        newAttributeNames
    ) {
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
        if (address == undefined) {
            return null;
        }
        let sql =
            "insert into addresses(street_name,street_name2,street_nr,zip_code,city) values(@street_name,@street_name2,@street_nr,@zip_code,@city)";
        try {
            const res = this.db.prepare(sql).run(address);
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

    getItems(callback = console.log) {
        let sql =
            "SELECT * FROM items order by category is null,category,name is null,name;";
        try {
            const rows = this.db.prepare(sql).all();
            callback(true, rows);
        } catch (err) {
            callback(false, err);
        }
    }

    updateItems(items, callback = console.log) {
        let sql = `
      INSERT INTO items (name,category,cost_price,sellable,external_id) VALUES (@name,@category,@cost_price,@sellable,@external_id)
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
                this.db.prepare(sql)
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
            o.id=o.id=='null'?null:o.id;
            o.izettle_product_id=o.izettle_product_id=='null'?null:o.izettle_product_id;
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
        where bon_id=? order by sorting_order`;

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
        let sql =
            "SELECT * FROM messages order by coalesce(sortorder,'Z'),id";
        try {
            const rows = this.db.prepare(sql).all();
            callback(true, rows);
        } catch (err) {
            callback(false, err);
        }
    }
    createMessage(message,callback = console.log) {
        let sql ="INSERT INTO messages(name,message,sortorder) values(?,?,?)";
        try {
            const res = this.db.prepare(sql).run(message.name,message.message,message.sortorder);
            message.id=res.lastInsertRowid;
            callback(true,message);
        } catch (err) {
            callback(false,err.code);
        }
    }

    updateMessages(id,message,callback = console.log) {
        let sql = "update messages set name=?,message=?,sortorder=? where id=?";
        try {
            this.db.prepare(sql).run(message.name,message.message,message.sortorder, id);
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

    getNotifiedBon(userId,callback=console.log) {
        let sql="select bon_id from notified_bons b where user_id<>? and not exists (select null from notified_bons where bon_id=b.bon_id and user_id=?) order by notify_date limit 1";
        let res = this.db.prepare(sql).get(userId,userId);
        if(res) {
            callback(true,res);
        } else {
            callback(false);
        }
    }

    seeBon(userId,bonId,callback=console.log) {
        let sql = "insert into notified_bons(user_id,bon_id) values(?,?) on conflict(user_id,bon_id) DO NOTHING";
        this.db.prepare(sql).run(userId, bonId);
        callback(true);
    }

    notifyBon(userId, bonId, callback = console.log) {

        let sql="delete from notified_bons where bon_id=? and user_id<>?";        
        this.db.prepare(sql).run(bonId,userId);
        sql = "insert into notified_bons(user_id,bon_id) values(?,?) on conflict(user_id,bon_id) DO NOTHING";
        this.db.prepare(sql).run(userId, bonId);
        callback(true);

    }



    complementWithGrocyIds(orders,callback = console.log) {
        let grocySql="select external_id from items where id=?";
        let grocyStmt=this.db.prepare(grocySql);
        let izettleSQl="select i.external_id from izettle_products iz join items i on iz.grocy_item_id =i.id where iz.id=?"
        let izettleStmt=this.db.prepare(izettleSQl);

        orders.forEach(o=> {
            if(o.id!="") {
                let row=grocyStmt.get(o.id);
                o.external_id=row?.external_id;
            } else if (o.izettle_product_id!="") {
                let row=izettleStmt.get(o.izettle_product_id);
                o.external_id=row?.external_id;
            }
        })
        callback(true,orders);

        

    }

}