const fetch = require('node-fetch');

module.exports = class GrocyFunctions {
    constructor(config) {
        this.config = config;
        console.log("updating Grocy cache for "+config.bonInstance);
        this.updateCache(()=>{
            console.log("updated Grocy cache for "+config.bonInstance);
        });
    }

    getRecipy(recipyId) {
        return this.allRecipies[recipyId];
    }


    getIngredients(recipyId) {
        let res={products:[],nestedRecipies:[]};
        let recipy=this.allRecipies[recipyId];
        if(!recipy) {
            return res;
        }
        recipy.ingredients?.forEach(i=>{
            res.products.push({
              name:i.name,
              stock_amount:i.stock_amount/(recipy.base_servings*1.0),
              stock_unit:{name:i.qu_id_stock.name,name_plural:i.qu_id_stock.name_plural},
              purchase_amount:i.purchase_amount/(recipy.base_servings*1.0),
              variable_amount:i.variable_amount,
              purchase_unit:{name:i.qu_id_purchase.name,name_plural:i.qu_id_purchase.name_plural},
              in_stock:i.in_stock,
              in_stock_purchase_unit:i.in_stock_purchase_unit
            });
        })
        let nested_unit={name:"Portion",name_plural:"Portioner"}
        recipy.nested_recipies?.forEach(n=>{
            res.nestedRecipies.push({
                name:n.recipy.name,
                recipy:this.getIngredients(n.recipy.external_id),
                servings:n.servings,
                purchase_unit:nested_unit,
                stock_unit:nested_unit,
                numberInStock:n.numberInStock

            });
        })
        return res;  
    }



    addStockInfo(recipyId,stock) {
        let recipy = this.allRecipies[recipyId];
        if (!recipy) {
            return;
        }
        recipy.ingredients?.forEach(i=>{
            i.in_stock=stock[i.product_id]?stock[i.product_id].amount:0;
            if(i.conversion) {
                i.in_stock_purchase_unit=i.in_stock*i.conversion.factor*1.0;
            } else {
                i.in_stock_purchase_unit=i.in_stock;
            }
            
        });
        recipy.nested_recipies?.forEach(n=>{
            this.addStockInfo(n.recipy.external_id,stock)
        })
    }


    calculateNumberInStock(recipyId) {
        let recipy=this.allRecipies[recipyId];
        if(!recipy) {
            return undefined;
        }
        let minAmount=Number.MAX_VALUE;
        let products=this.getAllProductsForRecipy(recipyId);
        products.forEach(p=>{
            let amountInStock=(p.in_stock!=undefined?p.in_stock:0)/p.stock_amount;
            amountInStock=amountInStock/recipy.base_servings;
            if(amountInStock<minAmount) {
                minAmount=amountInStock;
            }
        })

        recipy?.nested_recipies?.forEach(r=>{
            r.numberInStock=this.calculateNumberInStock(r.recipy_id);
        })
        recipy.numberInStock=Math.trunc(minAmount);
        return recipy.numberInStock;

    }


  /**
   * Get amount of all products in stock
   * @param {function} callback - function(status,products)
   *                          @param status {boolean} true if the call to grocy succeed.
   *                          @param products {{product_id:{name,amount}}} Object with product_id as keys and name and amount as value
   */
    getCurrentStock(callback = console.log) {
        let stock = {};
        let httpReq = this.config.grocy.url + "/api/stock?GROCY-API-KEY=" + this.config.grocy.apiKey;
        fetch(httpReq)
            .then((res) => res.json())
            .then((products) => {
                products.forEach((p) => {
                    stock[p.product_id] = {
                        product_id: p.product_id,
                        name: p.product.name,
                        amount: p.amount_aggregated,
                    }      
                })
                callback(true, stock);
            })
            .catch((err) => {
                callback(false, err);
            });

    }






    consumeRecipy(amount,recipyId) {
        let products=this.getAllProductsForRecipy(recipyId);
        products.forEach(p=>{
            let amount_to_consume=amount*p.stock_amount;
            this.consumeProduct(p.product_id,amount_to_consume,(status,consumed_amount)=>{
                
                if(status) {
                    if(consumed_amount<amount_to_consume) {
                        this.addToShoppingList(p.product_id,(status)=>{
                            if(status) {
                                console.log(`adding ${p.name} to shoppinglist`);
                            } else {
                                console.log(`failed to add ${p.name} to shoppinglist`);
                            }
                        })
                    }
                } else {
                    console.log(`failed to consume ${p.name}`);
                }
            })

        })

    }


    calculatePriceForRecipy(recipyId) {
        let recipy=this.allRecipies[recipyId];
        if(!recipy) {
            return 0;
        }
        let productsPrice=0;
        recipy.ingredients?.forEach((i)=>{
            productsPrice+=i.stock_price;
        });

        let nestedPrices=0;
        recipy.nested_recipies?.forEach(n=>{
            nestedPrices+=(n.servings?n.servings:1)*this.calculatePriceForRecipy(n.recipy.external_id);
        });

        return (productsPrice+nestedPrices)/recipy.base_servings;

    }

    getAllProductsForRecipy(recipyId) {
        let recipy=this.allRecipies[recipyId];
        if(!recipy) {
            return [];
        }

        let unique={};
        recipy.ingredients?.forEach(i=>{
            if(!unique[i.name]) {
                unique[i.name]={
                    product_id:i.product_id,
                    name:i.name,
                    stock_amount:0.0,
                    stock_unit:i.qu_id_stock,
                    in_stock:i.in_stock
                }
            }
            unique[i.name].stock_amount+=i.stock_amount/(recipy.base_servings*1.0);
        })
        recipy.nested_recipies?.forEach(n=>{
            let products=this.getAllProductsForRecipy(n.recipy.external_id);
            products.forEach(p=>{
                if(!unique[p.name]) {
                    unique[p.name]={
                        product_id:p.product_id,
                        name:p.name,
                        stock_amount:0.0,
                        stock_unit:p.stock_unit,
                        in_stock:p.in_stock
                    }
                }
                unique[p.name].stock_amount+=p.stock_amount*n.servings; 
                


            })
        });

        return Object.values(unique);

    }



  /**
   * Withdraw an amount of a product from grocy
   *
   * @param {*} productId the grocy product-id
   * @param {*} quantityAmount total amount of the product
   * @param {*} callback fun(status,consumed_amount)
   *                          status - true if call succeeded
   *                          consumed_amount - total amount consumed from grocy.
   */

  consumeProduct(productId, quantityAmount, callback = console.log) {
    let httpReq =this.config.grocy.url +"/api/stock/products/" +productId +"?GROCY-API-KEY=" +this.config.grocy.apiKey;
    fetch(httpReq)
      .then((res) => res.json())
      .then(
        (json) => {
          let stock_amount = json.stock_amount;
          let consumed_amount =
            quantityAmount < stock_amount ? quantityAmount : stock_amount;
          httpReq =this.config.grocy.url +"/api/stock/products/" +productId +"/consume" +"?GROCY-API-KEY=" +this.config.grocy.apiKey;
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
    let httpReq =this.config.grocy.url +"/api/stock/shoppinglist/add-product" +"?GROCY-API-KEY=" +this.config.grocy.apiKey;
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




    getAllRecipes(callback) {
        callback(Object.values(this.allRecipies));
    }


    updateCache(callback) {
        this.buildAllRecipes((recipies)=>{
            this.allRecipies=recipies;
            Object.keys(this.allRecipies).forEach(k=>{
                this.allRecipies[k].calculated_price=+(this.calculatePriceForRecipy(k).toFixed(2));
            })
            callback && callback(recipies);
        })
    }


    buildAllRecipes(callback = console.log) {
        let recipes = {};
        this.getAllObjects((objects) => {
            let productsLookUp = {};
            objects["products"].forEach(p => {
                productsLookUp[p.id] = p;
            })

            let last_purchased={};
            objects["products_last_purchased"].forEach(l=>{
                last_purchased[l.product_id]=l;
            })

            let quantityUnitLookUp = {};
            objects["quantity_units"].forEach(u => {
                quantityUnitLookUp[u.id] = u;
            })


            let quantityUnitsConversionLookup={};
            objects["quantity_unit_conversions"].forEach(q=>{
                quantityUnitsConversionLookup[`${q.from_qu_id},${q.to_qu_id},${q.product_id}`]=q;
            })

            let recipePosLookup = {};
            objects["recipes_pos"].forEach(p => {
                let recipe_id = p.recipe_id;
                if (recipePosLookup[recipe_id] == undefined) {
                    recipePosLookup[recipe_id] = [];
                }
                recipePosLookup[recipe_id].push(this.parseIngredient(p,productsLookUp,quantityUnitsConversionLookup,quantityUnitLookUp,last_purchased));
            })



            objects["recipes"].forEach(r=>{
                let recipe_id=r.id;
                recipes[recipe_id]=this.parseRecipe(r);
                recipes[recipe_id].ingredients=recipePosLookup[recipe_id];
            })


            objects["recipes_nestings"].forEach(n=>{
                let recipy=recipes[n.recipe_id];
                if(!recipy) {
                    //console.log(`${n.recipe_id} is not an id for a recipy`);
                    return;
                }
                if(!recipy.nested_recipies) {
                    recipy.nested_recipies=[];
                }
                recipy.nested_recipies.push({recipy:recipes[n.includes_recipe_id],servings:n.servings,recipy_id:n.includes_recipe_id});
            })

            if(callback!=null) {
                callback(recipes);
            }

        })
    }



    getAllObjects(callback = console.log) {
        let objects = [
            "products",
            "recipes",
            "recipes_pos",
            "recipes_nestings",
            "quantity_units",
            "quantity_unit_conversions",
            "products_last_purchased"
        ];
        let res = {}
        let requests = objects.length;
        objects.forEach(o => {
            this.getGrocyObjects(o, (status, objs) => {
                if(status) {
                    res[o] = objs;
                } else {
                    res[o]=[];
                }
                requests--;
                if (requests == 0) {
                    callback(res);
                }
            })
        })

    }


    getGrocyObjects(objectName, callback) {

        let httpReq = `${this.config.grocy.url}/api/objects/${objectName}?GROCY-API-KEY=${this.config.grocy.apiKey}&dummy=${Date.now()}`;
        fetch(httpReq, {cache: 'no-store'})
            .then((res) => res.json())
            .then(
                (json) => {
                    callback(true, json);
                },
                (err) => {
                    console.log(`getGrocyObjects for instance "${this.config.bonInstance}" failed:`,err);
                    callback(false, err)
                }
            );
    }





    parseIngredient(recipy_pos,productLookUp,conversionLookup,quantityUnitLookUp,purchaseLookup) {
        let p=productLookUp[recipy_pos.product_id];
        //console.log(recipy_pos);
        //console.log(p);
        let purchase_amount=recipy_pos.amount;
        let conversion=conversionLookup[`${p.qu_id_stock},${recipy_pos.qu_id},${recipy_pos.product_id}`];
        if(conversion==undefined) {
            conversion=conversionLookup[`${p.qu_id_stock},${recipy_pos.qu_id},null`];
        }
        if(conversion!=undefined) {
            purchase_amount=recipy_pos.amount*conversion.factor;
        }
        let res={
            name:p.name,
            product_id:p.id,
            stock_amount:recipy_pos.amount,
            qu_id_stock:quantityUnitLookUp[p.qu_id_stock],
            qu_id_purchase:quantityUnitLookUp[recipy_pos.qu_id],
            conversion:conversion,
            purchase_amount:purchase_amount,
            variable_amount:recipy_pos.variable_amount,
            stock_price:(purchaseLookup[p.id]?.price?purchaseLookup[p.id]?.price:0)*(recipy_pos.amount?recipy_pos.amount:0)
        }
        //console.log(res);
        return res;
    }

    parseRecipe(recipe) {

            let sign = 1;
            if (recipe.name.match(/.*rabat.*/i)) {
                //Grocy-db can't handle negative values. So we negates the value if the item name contains the word rabat.
                sign = -1;
            }

            let salesPrices = {};
            Object.keys(recipe.userfields)
                .filter((k) => k.match(/^Salesprice.*/) != null)
                .forEach((k) => {
                    let priceCategory = k.replace("Salesprice", "");
                    salesPrices[priceCategory] = recipe.userfields[k] * sign;
                });

            return {
                name: recipe.name,
                category: recipe.userfields ? recipe.userfields.grupper : "",
                cost_price: recipe.userfields ? recipe.userfields.costprice * sign : "",
                sellable: recipe.userfields ? recipe.userfields.sellable : "",
                sellableZettle: recipe.userfields ? recipe.userfields.sellableZettle : "",
                external_id: recipe.id,
                salesPrices: salesPrices,
                base_servings:recipe.base_servings
            };
    }

}


