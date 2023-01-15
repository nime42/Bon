
const fetch = require('node-fetch');

module.exports = class GrocyFunctionsClass {
  constructor(config) {
    this.config = config;
  }

  /**
     * Get all recipies from Grocy DB
     * @param {*} callback - function(status,products)
     *                          @param status {boolean} true if the call to grocy succeed.
     *                          @param recepies {[Obj]} array with recpyinfo (see function parseRecipes below)
     
     * 
     */
  getAllRecipes(callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/objects/recipes?GROCY-API-KEY=" +
      this.config.grocy.apiKey;

    fetch(httpReq)
      .then((res) => res.json())
      .then(
        (json) => {
          callback(true, this.parseRecipes(json));
        },
        (err) => callback(false, err)
      );
  }

  /**
     * Get all products from Grocy DB
     * @param {*} callback - function(status,products)
     *                          @param status {boolean} true if the call to grocy succeed.
     *                          @param recepies {[Obj]} array with productinfo
     
     * 
     */
  getAllProducts(callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/objects/products?GROCY-API-KEY=" +
      this.config.grocy.apiKey;

    fetch(httpReq)
      .then((res) => res.json())
      .then(
        (json) => {
          callback(true, json);
        },
        (err) => callback(false, err)
      );
  }

  /**
   * Gets all Grocy-products as an lookup-array with product-id as key.
   * If there we have a cached product array, that one is returned imediately
   * and the function does a new call to grocy in the background.
   * @param {[product]<id>} callback
   */
  getCachedProducts(callback = console.log) {
    if (this.cachedProducts) {
      callback(this.cachedProducts);
      //this.updateCachedProducts();
    } else {
      this.updateCachedProducts(callback);
    }
  }


  cachedProducts = null;
  updateCachedProducts(callback) {
    this.getAllProducts((status, products) => {
      if (status) {
        this.cachedProducts = {};
        products.forEach((p) => {
          this.cachedProducts[p.id] = p;
        });
      } else {
        console.log("Failed to get the products", products);
      }
      if (callback) {
        callback(this.cachedProducts);
      }
    });
  }

  /**
   * Gets all Grocy-recipies as an lookup-array with product-id as key.
   * If there we have a cached recipy array, that one is returned imediately
   * and the function does a new call to grocy in the background.
   * @param {[product]<id>} callback
   */
  getCachedRecipies(callback = console.log) {
    if (this.cachedRecipies) {
      callback(this.cachedRecipies);
      //this.updateCachedRecepies();
    } else {
      this.updateCachedRecipies(callback);
    }
  }

  cachedRecipies = null;
  updateCachedRecipies(callback) {
    this.getAllRecipes((status, recipies) => {
      if (status) {
        this.cachedRecipies = {};
        recipies.forEach((p) => {
          this.cachedRecipies[p.id] = p;
        });
      } else {
        console.log("Failed to get the recipies", recipies);
      }
      if (callback) {
        callback(this.cachedRecipies);
      }
    });
  }


  /**
     * Get all quantity units from Grocy DB
     * @param {*} callback - function(status,qunatityUnits)
     *                          @param status {boolean} true if the call to grocy succeed.
     *                          @param recepies {[Obj]} array with quantity unit info
     
     * 
     */
  getAllQuantityUnits(callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/objects/quantity_units?GROCY-API-KEY=" +
      this.config.grocy.apiKey;

    fetch(httpReq)
      .then((res) => res.json())
      .then(
        (json) => {
          callback(true, json);
        },
        (err) => callback(false, err)
      );
  }
  getCachedQuantityUnits(callback=console.log) {
    if (this.cachedQuantityUnits) {
        callback(this.cachedQuantityUnits);
        //this.updateQuantityUnits();
      } else {
        this.updateQuantityUnits(callback);
      }
  }

  cachedQuantityUnits=null;
  updateQuantityUnits(callback) {
    this.getAllQuantityUnits((status, quantityUnits) => {
        if (status) {
          this.cachedQuantityUnits = {};
          quantityUnits.forEach((p) => {
            this.cachedQuantityUnits[p.id] = p;
          });
        } else {
          console.log("Failed to get theQuantityUnits", quantityUnits);
        }
        if (callback) {
          callback(this.cachedQuantityUnits);
        }
      });
  }

  clearCache() {
    this.cachedProducts=null;
    this.cachedRecipies=null;
    this.cachedQuantityUnits=null;
  }




  complementOrdersWithProducts(orders, callback) {
    this.getCachedProducts((products) => {
        this.getCachedQuantityUnits((quantityUnits)=> {
            let nrOfOrders = orders.length;
            orders.forEach((o) => {
              this.complementOrderWithProducts(o, products,quantityUnits, () => {
                nrOfOrders--;
                if (nrOfOrders == 0) {
                  callback(true);
                }
              });
            });
      
        })
    });
  }

  complementOrderWithProducts(order, productArr,quantityUnitsArr, callback) {
    this.getRecipieProducts(order.external_id, (status, products) => {
      let productList = products.map((p) => {
        let res={};
        res.product_id=p.product_id;
        res.amount=p.amount;
        res.name = productArr[p.product_id].name;
        res.quantityUnitName=quantityUnitsArr[p.qu_id].name;
        res.quantityUnitName_plural=quantityUnitsArr[p.qu_id].name_plural;
        res.quick_consume_amount=productArr[p.product_id].quick_consume_amount;
        res.qu_id_stock=productArr[p.product_id].qu_id_stock;
        res.qu_factor_purchase_to_stock=productArr[p.product_id].qu_factor_purchase_to_stock;
        res.stockQuantityUnitName=quantityUnitsArr[productArr[p.product_id].qu_id_stock].name;
        res.stockQuantityUnitName_plural=quantityUnitsArr[productArr[p.product_id].qu_id_stock].name_plural;
        return res;
      });
      order.productList = productList;
      callback(true);
    });
  }

  /**
   * Get all products that belongs to a recipe.
   * @param {*} recipe_external_id
   * @param {*} callback - function(status,products)
   *                          @param status {boolean} true if the call to grocy succeed.
   *                          @param products {[{product_id,amount}]} array with productid and the amount of the product needed for the recipe
   */
  getProductIds(recipe_external_id, callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/objects/recipes_pos?query[]=recipe_id=" +
      recipe_external_id +
      "&GROCY-API-KEY=" +
      this.config.grocy.apiKey;
    fetch(httpReq)
      .then((res) => res.json())
      .then(
        (json) => {
          callback(true, json);
        },
        (err) => callback(false, err)
      );
  }

  /**
   * Get all sub recipies for the recipe.
   * @param {*} recipe_external_id
   * @param {*} callback - function(status,products)
   *                          @param status {boolean} true if the call to grocy succeed.
   *                          @param products {[Integer]}  Array with ids for the sub recipes.
   */
  getNestedRecipes(recipe_external_id, callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/objects/recipes_nestings?query[]=recipe_id=" +
      recipe_external_id +
      "&GROCY-API-KEY=" +
      this.config.grocy.apiKey;
    fetch(httpReq)
      .then((res) => res.json())
      .then(
        (json) => {
          let products = json.map((e) => e.includes_recipe_id);
          callback(true, products);
        },
        (err) => callback(false, err)
      );
  }

  /**
     * Get all products for a recepe (including subrecipes)
     * @param {Integer} recipe_external_id 
     * @param {function} callback - function(status,products)
     *                          @param status {boolean} true if the call to grocy succeed.
     *                          @param products {[{product_id,amount}]} array with productid and the amount of the product needed for the recipe
    
     */
  getRecipieProducts(recipe_external_id, callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/objects/recipes/" +
      recipe_external_id +
      "?GROCY-API-KEY=" +
      this.config.grocy.apiKey;
    fetch(httpReq)
      .then((res) => res.json())
      .then(
        (json) => {
          let recipeInfo = json; //RecipeInfo contains number of servings per recipe
          this.getProductIds(recipe_external_id, (status, products) => {
            //get all products for the recipe
            if (status) {
              products.forEach((e) => {
                e.org_amount=e.amount;
                e.recipe_base_servings=recipeInfo.base_servings;
                e.amount = e.amount / (recipeInfo.base_servings * 1.0);

              });
              this.getNestedRecipes(
                recipe_external_id,
                (status, incRecepies) => {
                  if (status) {
                    this.getMultipleRecipieProducts(
                      incRecepies,
                      (status, moreProducts) => {
                        if (status) {
                          moreProducts.forEach((e) => {
                            e.amount =
                              e.amount / (recipeInfo.base_servings * 1.0);
                          });
                          callback(true, products.concat(moreProducts));
                        } else {
                          callback(false, moreProducts);
                        }
                      }
                    );
                  } else {
                    callback(false, incRecepies);
                  }
                }
              );
            } else {
              callback(false, products);
            }
          });
        },
        (err) => callback(false, err)
      );
  }

  /**
   * Get amount of all products in stock
   * @param {function} callback - function(status,products)
   *                          @param status {boolean} true if the call to grocy succeed.
   *                          @param products {{product_id:{name,amount}}} Object with product_id as keys and name and amount as value
   */
  getCurrentStock(callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/stock?GROCY-API-KEY=" +
      this.config.grocy.apiKey;
    fetch(httpReq)
      .then((res) => res.json())
      .then((products) => {
        httpReq =
          this.config.grocy.url +
          "/api/stock/volatile?GROCY-API-KEY=" +
          this.config.grocy.apiKey;
        fetch(httpReq)
          .then((res) => res.json())
          .then((missing) => {
            let res = {};
            products.forEach((p) => {
              res[p.product_id] = {
                name: p.product.name,
                amount: p.amount_aggregated,
              };
            });
            missing.missing_products.forEach((m) => {
              res[m.id] = {
                name: m.name,
                amount: 0,
                amount_missing: m.amount_missing,
              };
            });
            callback(true, res);
          })
          .catch((err) => {
            callback(false, err);
          });
      })
      .catch((err) => {
        callback(false, err);
      });
  }

  checkBonsAgainstStock(bons, callback = console.log) {
    if (bons.length === 0) {
      callback(true, bons);
      return;
    }

    this.getCurrentStock((status, stock) => {
      if (!status) {
        callback(status, stock);
        return;
      }
      let uniqueRecipies = {};
      bons.forEach((b) => {
        b.orders.forEach((o) => {
          uniqueRecipies[o.external_id] = 1;
        });
      });
      let recepieProducts = {};
      let recepieIds = Object.keys(uniqueRecipies);
      recepieIds.forEach((r) => {
        this.getRecipieProducts(r, (status, products) => {
          if (!status) {
            callback(status, products);
            return;
          }
          recepieProducts[r] = products;
          if (Object.keys(recepieProducts).length == recepieIds.length) {
            bons.forEach((b) => {
              this.checkBon(b, recepieProducts, stock);
            });
            callback(true, bons);
          }
        });
      });
    });
  }

  checkBon(bon, recepies, stock) {
    bon.orders.forEach((o) => {
      let products = recepies[o.external_id];
      let actual_quantity = o.quantity;
      let missing_products = {};
      products.forEach((p) => {
        let tot_amount = p.amount * o.quantity;
        let remains = stock[p.product_id].amount - tot_amount;
        if (remains < 0) {
          let q = Math.floor(stock[p.product_id].amount / (p.amount * 1.0));
          if (1 < actual_quantity) {
            actual_quantity = q;
          }
          missing_products[p.product_id] = {
            missing: remains,
            name: stock[p.product_id].name,
          };
        }
        stock[p.product_id].amount -= tot_amount;
      });
      o.missing = {
        actual_quantity: actual_quantity,
        missing_products: missing_products,
      };
    });
    this.createMissingSummary(bon);
    return [bon, stock];
  }

  createMissingSummary(bon) {
    let res = [];
    let isMissing = false;
    bon.orders.forEach((o) => {
      if (o.quantity > o.missing.actual_quantity) {
        isMissing = true;
        res.push({
          quantity: o.quantity,
          actual_qantity: o.missing.actual_quantity,
          category: o.category,
          name: o.name,
        });
      }
    });
    if (isMissing) {
      bon.missingSummary = res;
    }
  }

  /**
     * Get all products for an array of recipes
     * @param {[Integer]} recipeIds 
     * @param {function} callback - function(status,products)
     *                          @param status {boolean} true if the call to grocy succeed.
     *                          @param products {[{product_id,amount}]} array with productid and the amount of the product needed for the recipe
    
     * @param {[Integer]?} rest just a helper argument when recursing through all recipies 
     * @returns 
     */
  getMultipleRecipieProducts(
    recipeIds,
    callback = console.log,
    rest = undefined
  ) {
    if (rest === undefined) {
      this.getMultipleRecipieProducts(
        recipeIds.slice(0, 1),
        callback,
        recipeIds.slice(1)
      );
      return;
    }
    if (recipeIds.length === 0) {
      callback(true, []);
      return;
    }

    this.getRecipieProducts(recipeIds[0], (status, products) => {
      this.getMultipleRecipieProducts(
        rest.slice(0, 1),
        (status, moreProducts) => {
          callback(true, products.concat(moreProducts));
        },
        rest.slice(1)
      );
    });
  }

  consumeItem(quantity, recipe_external_id) {
    this.getRecipieProducts(recipe_external_id, (status, products) => {
      products.forEach((p) => {
        //console.log("consumeItem", recipe_external_id, p);
        this.consumeProduct(
          p.product_id,
          quantity * parseFloat(p.amount),
          (status, actual_amount) => {
            if (quantity * parseFloat(p.amount) != actual_amount) {
              this.addToShoppingList(p.product_id, (status, res) => {
                if (!status) {
                  console.log("addToShoppingList", res);
                }
              });
            }
          }
        );
      });
    });
  }

  /**
   * Withdraw an amount of a product from grocy
   *
   * @param {*} productId the grocy product-id
   * @param {*} quantityAmount total amount of the product
   * @param {*} callback fun(status,consumed_amount)
   *                          status - true if call succeeded
   *                          consumed_amount - total amount consumed, total amount consumed from grocy.
   */

  consumeProduct(productId, quantityAmount, callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/stock/products/" +
      productId +
      "?GROCY-API-KEY=" +
      this.config.grocy.apiKey;
    fetch(httpReq)
      .then((res) => res.json())
      .then(
        (json) => {
          let stock_amount = json.stock_amount;
          let consumed_amount =
            quantityAmount < stock_amount ? quantityAmount : stock_amount;
          httpReq =
            this.config.grocy.url +
            "/api/stock/products/" +
            productId +
            "/consume" +
            "?GROCY-API-KEY=" +
            this.config.grocy.apiKey;
          let body = {
            amount: consumed_amount,
            transaction_type: "consume",
            spoiled: false,
          };

          fetch(httpReq, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(body),
          })
            .then(function (res) {
              callback(true, consumed_amount);
            })
            .catch(function (res) {
              callback(false, 0);
            });
        },
        (err) => {
          console.log("failed", err);
          callback(false, err);
        }
      );
  }

  /**
   * Add a product to shopping list in Grocy
   * @param {*} productId
   * @param {*} callback
   */
  addToShoppingList(productId, callback = console.log) {
    let httpReq =
      this.config.grocy.url +
      "/api/stock/shoppinglist/add-product" +
      "?GROCY-API-KEY=" +
      this.config.grocy.apiKey;
    let body = {
      product_id: productId,
      list_id: 1,
      product_amount: 1,
      note: "Uppdateret från Bon",
    };

    fetch(httpReq, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(body),
    })
      .then(function (res) {
        callback(true);
      })
      .catch(function (res) {
        callback(false, res);
      });
  }

  parseRecipes(recipes) {
    return recipes.map((r) => {
      let sign = 1;
      if (r.name.match(/.*rabat.*/i)) {
        //Grocy-db can't handle negative values. So we negates the value if the item name contains the word rabat.
        sign = -1;
      }

      let salesPrices = {};
      Object.keys(r.userfields)
        .filter((k) => k.match(/^Salesprice.*/) != null)
        .forEach((k) => {
          let priceCategory = k.replace("Salesprice", "");
          salesPrices[priceCategory] = r.userfields[k] * sign;
        });

      return {
        name: r.name,
        category: r.userfields ? r.userfields.grupper : "",
        cost_price: r.userfields ? r.userfields.costprice * sign : "",
        sellable: r.userfields ? r.userfields.sellable : "",
        sellableZettle: r.userfields ? r.userfields.sellableZettle : "",
        external_id: r.id,
        salesPrices: salesPrices,
      };
    });
  }
};

