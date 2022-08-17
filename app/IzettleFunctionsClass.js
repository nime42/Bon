const fetch = require("node-fetch");

module.exports = class IzettleFunctionsClass {
  constructor(config,dbFile) {
    this.config = config;
    var sqlite3 = require("better-sqlite3");
    this.db= new sqlite3(dbFile);
    this.db.pragma("foreign_keys = ON");
  }

  getToken(callBack = console.log) {
    let body = `grant_type=${this.config.iZettle.grant_type}&client_id=${this.config.iZettle.client_id}&assertion=${this.config.iZettle.api_key}`;

    fetch(this.config.iZettle.auth_server, {
      method: "POST",
      body: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then(function (resp) {
        // Return the response as JSON
        return resp.json();
      })
      .then(function (data) {
        callBack(true, data.access_token);
      })
      .catch(function (err) {
        // Log any errors
        callBack(false, err);
      });
  }





  getPurchaseList(callBack = console.log,daysBack=1) {
    let re = new RegExp(this.config.iZettle.filter, "i");
    let filterFunction = (e) => {
      return e.userDisplayName.match(re);
    };

    let httpArgs;
    let lastPurchaseHash=this.getLastPurchaseHash();
    if(lastPurchaseHash) {
      httpArgs=`lastPurchaseHash=${lastPurchaseHash}`;
    } else {
      var d = new Date();
      d.setDate(d.getDate()-daysBack);
      httpArgs=`startDate=${d.toISOString()}`;
    }


    let self=this;
    this.getToken((status, token) => {
      if (status) {
        fetch(this.config.iZettle.api_url + "/purchases/v2?"+httpArgs, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `bearer ${token}`,
          },
        })
          .then(function (resp) {
            // Return the response as JSON
            return resp.json();
          })
          .then(function (data) {
            let purchaseList=data.purchases
            .map((e) => ({
              purchaseUUID1: e.purchaseUUID1,
              userDisplayName: e.userDisplayName,
              created:e.created
            }))
            .filter(filterFunction);

            self.getAllPurchases(token,purchaseList,(purchases)=>{
              self.savePurchases(purchases);
              self.updateLastPurchaseHash(data.lastPurchaseHash);
              callBack(purchases);
            })


          })
          .catch(function (err) {
            throw err;
         })
    
      };
    })
      
  }






  getAllPurchases(token,purchaseList,callback,purchases=[]) {
    if(purchaseList.length==0) {
      callback(purchases);
    } else {
      let p=purchaseList[0];
      let rest=purchaseList.slice(1);
      this.getPurchase(token, p.purchaseUUID1, (status, purchase) => {
        console.log(purchases.length);
        if (status) {
          purchase.created=p.created;
          purchase.userDisplayName=p.userDisplayName;
          purchases.push(purchase);
          this.getAllPurchases(token,rest,callback,purchases);
        } else {
          console.log("Error",p.purchaseUUID1, purchase);
        }        
    });
  }
}

  processAllPurchases(purchaseList, callBack = console.log) {
    this.getToken((status, token) => {
      if (status) {
        let res=[];
        let nrOfPurchases=purchaseList.length;
        purchaseList.forEach((p) => {
          this.getPurchase(token, p.purchaseUUID1, (status, purchase) => {
            if (status) {
              res.push(purchase);
            } else {
              console.log("Error",p.purchaseUUID1, purchase);
            }
            nrOfPurchases--;
            if(nrOfPurchases==0) {
                callBack(true,res);
            }
          });
        });
      } else {
        callBack(false, token);
      }
    });
  }

  getPurchase(token, purchaseUUID, callBack=console.log) {
    let e;
    fetch(this.config.iZettle.api_url + "/purchase/v2/" + purchaseUUID, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `bearer ${token}`,
      },
    })
      .then(function (resp) {
        // Return the response as JSON
        e=resp;
        return resp.json();
      })
      .then(function (data) {
        let products=data.products.map(p=>(
            {
                quantity:p.quantity,
                name:p.name,
                unitPrice:p.unitPrice
            }
        ));
        let res={
            purchaseUUID:data.purchaseUUID,
            purchaseNumber:data.purchaseNumber,
            products:products
        }
        callBack(true, res);
      })
      .catch(function (err) {
        // Log any errors
        console.log(e);
        callBack(false, err);
      });
  }

  getProducts(callBack=console.log) {
    this.getToken((status, token) => {
      if (status) {
        fetch(this.config.iZettle.products_api_url + "/organizations/"+this.config.iZettle.orgUuid+"/products/v2", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `bearer ${token}`,
          },
        })
          .then(function (resp) {
            // Return the response as JSON
            return resp.json();
          })
          .then(function (data) {
            callBack(true, data);
          })
          .catch(function (err) {
            // Log any errors
            callBack(false, err);
          });
      } else {
        callBack(false,token);
      }
    }
    )


  }


  getLastPurchaseHash() {
    let sql="select purchase_data from izettle_purchases where type='lastPurchaseHash'";
    const row = this.db.prepare(sql).get();
    if(row) {
      return row.purchase_data;
    } else {
      return null;
    }
  }

  updateLastPurchaseHash(lastPurchaseHash) {

    let sql="delete from izettle_purchases where type='lastPurchaseHash'";
    this.db.prepare(sql).run();
    sql="insert into izettle_purchases(type,purchase_data) values('lastPurchaseHash',?)";
    this.db.prepare(sql).run(lastPurchaseHash);

  }

  savePurchases(purchases) {
    let sql = `
    INSERT INTO izettle_purchases
    (type, purchaseUUID, purchase_nr, userDisplayName, created, bon_id, purchase_data)
    VALUES('purchase', @purchaseUUID, @purchaseNumber, @userDisplayName, @created, null, @purchase_data_string )
    ON CONFLICT(purchaseUUID) DO
    UPDATE SET type=excluded.type, purchase_nr=excluded.purchase_nr, userDisplayName=excluded.userDisplayName, created=excluded.created, purchase_data=excluded.purchase_data
    `;
    let statement=this.db.prepare(sql);

    purchases.forEach(p=>{
      p.purchase_data_string=JSON.stringify(p);
      statement.run(p);
    });


  }



};
