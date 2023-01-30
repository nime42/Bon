const fetch = require('node-fetch');

module.exports = class GrocyFunctions {
    constructor(config) {
        this.config = config;
        this.updateCache();
    }

    getRecipy(id) {
        return this.allRecipies[id];
    }


    getIngredients(id) {
        let res={products:[],nestedRecipies:[]};
        let recipy=this.allRecipies[id];
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
              purchase_unit:{name:i.qu_id_purchase.name,name_plural:i.qu_id_purchase.name_plural}
            });
        })
        let nested_unit={name:"Portion",name_plural:"Portioner"}
        recipy.nested_recipies?.forEach(n=>{
            res.nestedRecipies.push({
                name:n.recipy.name,
                recipy:this.getIngredients(n.recipy.external_id),
                servings:n.servings,
                purchase_unit:nested_unit,
                stock_unit:nested_unit
            });
        })

        return res;
        
    }


    getAllRecipes(callback) {
        callback(Object.values(this.allRecipies));
    }


    updateCache(callback) {
        this.buildAllRecipes((recipies)=>{
            this.allRecipies=recipies;
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
                recipePosLookup[recipe_id].push(this.parseIngredient(p,productsLookUp,quantityUnitsConversionLookup,quantityUnitLookUp));
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
                recipy.nested_recipies.push({recipy:recipes[n.includes_recipe_id],servings:n.servings});
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
            "quantity_unit_conversions"
        ];
        let res = {}
        let requests = objects.length;
        objects.forEach(o => {
            this.getGrocyObjects(o, (status, objs) => {
                res[o] = objs;
                requests--;
                if (requests == 0) {
                    callback(res);
                }
            })
        })

    }


    getGrocyObjects(objectName, callback) {

        let httpReq = `${this.config.grocy.url}/api/objects/${objectName}?GROCY-API-KEY=${this.config.grocy.apiKey}`;
        fetch(httpReq)
            .then((res) => res.json())
            .then(
                (json) => {
                    callback(true, json);
                },
                (err) => callback(false, err)
            );
    }





    parseIngredient(recipy_pos,productLookUp,conversionLookup,quantityUnitLookUp) {
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
            stock_amount:recipy_pos.amount,
            qu_id_stock:quantityUnitLookUp[p.qu_id_stock],
            qu_id_purchase:quantityUnitLookUp[recipy_pos.qu_id],
            conversion:conversion,
            purchase_amount:purchase_amount,
            variable_amount:recipy_pos.variable_amount
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


