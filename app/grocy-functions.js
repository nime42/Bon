const config = require('../resources/config.js');
const fetch = require('node-fetch');

/**
 * Get all recipies from Grocy DB
 * @param {*} callback - function(status,products)
 *                          @param status {boolean} true if the call to grocy succeed.
 *                          @param recepies {[Obj]} array with recepyinfo (see function parseRecipes below)
 
 * 
 */
function getAllRecipes(callback = console.log) {
    let httpReq = config.grocy.url + "/api/objects/recipes?GROCY-API-KEY=" + config.grocy.apiKey;

    fetch(httpReq)
        .then(res => res.json())
        .then(
            json => {
                callback(true, parseRecipes(json));
            },
            err => callback(false, err)
        );
}

/**
 * Get all products that belongs to a recipe.
 * @param {*} recipe_external_id 
 * @param {*} callback - function(status,products)
 *                          @param status {boolean} true if the call to grocy succeed.
 *                          @param products {[{product_id,amount}]} array with productid and the amount of the product needed for the recipe
 */
function getProductIds(recipe_external_id, callback = console.log) {
    let httpReq = config.grocy.url + "/api/objects/recipes_pos?query[]=recipe_id=" + recipe_external_id + "&GROCY-API-KEY=" + config.grocy.apiKey;
    fetch(httpReq)
        .then(res => res.json())
        .then(
            json => {
                let products = json.map(e => ({ product_id: e.product_id, amount: e.amount }));
                callback(true, products);

            },
            err => callback(false, err)
        );
}

/**
 * Get all sub recipies for the recipe.
 * @param {*} recipe_external_id 
 * @param {*} callback - function(status,products)
 *                          @param status {boolean} true if the call to grocy succeed.
 *                          @param products {[Integer]}  Array with ids for the sub recipes.
 */
function getNestedRecipes(recipe_external_id, callback = console.log) {
    let httpReq = config.grocy.url + "/api/objects/recipes_nestings?query[]=recipe_id=" + recipe_external_id + "&GROCY-API-KEY=" + config.grocy.apiKey;
    fetch(httpReq)
        .then(res => res.json())
        .then(
            json => {
                let products = json.map(e => (e.includes_recipe_id));
                callback(true, products);

            },
            err => callback(false, err)
        );
}

/**
 * Get all products for a recepe (including subrecipes)
 * @param {Integer} recipe_external_id 
 * @param {function} callback - function(status,products)
 *                          @param status {boolean} true if the call to grocy succeed.
 *                          @param products {[{product_id,amount}]} array with productid and the amount of the product needed for the recipe

 */
function getRecipieProducts(recipe_external_id, callback = console.log) {
    let httpReq = config.grocy.url + "/api/objects/recipes/" + recipe_external_id + "?GROCY-API-KEY=" + config.grocy.apiKey;
    fetch(httpReq)
        .then(res => res.json())
        .then(
            json => {
                let recipeInfo = json; //RecipeInfo contains number of servings per recipe
                getProductIds(recipe_external_id, (status, products) => { //get all products for the recipe
                    if (status) {
                        products.forEach(e => { e.amount = e.amount / (recipeInfo.base_servings * 1.0); });
                        getNestedRecipes(recipe_external_id, (status, incRecepies) => {
                            if (status) {
                                getMultipleRecipieProducts(incRecepies, (status, moreProducts) => {
                                    if (status) {
                                        moreProducts.forEach(e => { e.amount = e.amount / (recipeInfo.base_servings * 1.0); });
                                        callback(true, products.concat(moreProducts));
                                    } else {
                                        callback(false, moreProducts);
                                    }
                                })
                            } else {
                                callback(false, incRecepies);
                            }
                        })
                    } else {
                        callback(false, products);
                    }

                });

            },
            err => callback(false, err)
        );




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
function getMultipleRecipieProducts(recipeIds, callback = console.log, rest = undefined) {
    if (rest === undefined) {
        getMultipleRecipieProducts(recipeIds.slice(0, 1), callback, recipeIds.slice(1));
        return;
    }
    if (recipeIds.length === 0) {
        callback(true, []);
        return;
    }

    getRecipieProducts(recipeIds[0], (status, products) => {
        getMultipleRecipieProducts(rest.slice(0, 1), (status, moreProducts) => {
            callback(true, products.concat(moreProducts));

        }, rest.slice(1));

    })


}








function consumeItem(quantity, recipe_external_id) {
    getRecipieProducts(recipe_external_id, (status, products) => {
        products.forEach(p=>{
            console.log("consumeItem",recipe_external_id,p);
            consumeProduct(p.product_id,quantity*parseFloat(p.amount),(status,actual_amount)=>{
                    if(quantity*parseFloat(p.amount)!=actual_amount) {
                        addToShoppingList(p.product_id,(status,res)=>{
                            if(!status) {
                                console.log("addToShoppingList",res); 
                            }
                        })
                    }
            })    
        })
    })
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

function consumeProduct(productId, quantityAmount, callback = console.log) {
    let httpReq = config.grocy.url + "/api/stock/products/" + productId + "?GROCY-API-KEY=" + config.grocy.apiKey;
    fetch(httpReq)
        .then(res => res.json())
        .then(
            json => {
                let stock_amount = json.stock_amount;
                let consumed_amount = quantityAmount < stock_amount ? quantityAmount : stock_amount;
                httpReq = config.grocy.url + "/api/stock/products/" + productId + "/consume" + "?GROCY-API-KEY=" + config.grocy.apiKey;
                let body = {
                    "amount": consumed_amount,
                    "transaction_type": "consume",
                    "spoiled": false
                };


                fetch(httpReq,
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify(body)
                    })
                    .then(function (res) { callback(true, consumed_amount)})
                    .catch(function (res) {callback(false, 0) })




            },
            err => {console.log("failed",err);callback(false, err)}
        );
}

/**
 * Add a product to shopping list in Grocy
 * @param {*} productId 
 * @param {*} callback 
 */
function addToShoppingList(productId,callback=console.log) {
    let httpReq = config.grocy.url + "/api/stock/shoppinglist/add-product" + "?GROCY-API-KEY=" + config.grocy.apiKey;
    let body = {
        "product_id": productId,
        "list_id": 1,
        "product_amount": 1,
        "note": "Uppdateret från Bon"
      }


    fetch(httpReq,
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(body)
        })
        .then(function (res) {callback(true)})
        .catch(function (res) { callback(false,res) })



}



function parseRecipes(recipes) {
    return recipes.map(r => {

        let sign = 1;
        if (r.name.match(/.*rabat.*/i)) {
            //Grocy-db can't handle negative values. So we negates the value if the item name contains the word rabat.
            sign = -1;
        }

        let salesPrices = {};
        Object.keys(r.userfields).filter(k => (k.match(/^Salesprice.*/) != null)).forEach(k => {
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
            salesPrices: salesPrices
        }
    }
    );

}

module.exports = {
    getAllRecipes: getAllRecipes,
    consumeItem:consumeItem
}

