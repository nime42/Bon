const fetch = require("node-fetch");

module.exports = class IzettleFunctionsClass {
  constructor(config) {
    this.config = config;
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

  getPurchaseList(date, callBack = console.log) {
    let re = new RegExp(this.config.iZettle.filter, "i");
    let filterFunction = (e) => {
      return e.userDisplayName.match(re);
    };

    this.getToken((status, token) => {
      if (status) {
        fetch(this.config.iZettle.api_url + "/purchases/v2?startDate=" + date, {
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
            callBack(
              true,
              data.purchases
                .map((e) => ({
                  purchaseUUID: e.purchaseUUID,
                  purchaseUUID1: e.purchaseUUID1,
                  userDisplayName: e.userDisplayName,
                }))
                .filter(filterFunction)
            );
          })
          .catch(function (err) {
            // Log any errors
            callBack(false, err);
          });
      }
    });
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
    fetch(this.config.iZettle.api_url + "/purchase/v2/" + purchaseUUID, {
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
        callBack(false, err);
      });
  }

  getProducts(callBack=console.log) {
    this.getToken((status, token) => {
      if (status) {
        fetch(this.config.iZettle.products_api_url + "/organizations/self/products/v2", {
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

};
