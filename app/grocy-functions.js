const config = require('../resources/config.js');
const fetch = require('node-fetch');

function getAllRecipes(callback = console.log) {
    let httpReq = config.grocy.url + "/api/objects/recipes?GROCY-API-KEY=" + config.grocy.apiKey;
    console.log(httpReq);

    fetch(httpReq)
        .then(res => res.json())
        .then(
            json => {
                callback(true, parseRecipes(json));
            },
            err => callback(false, err)
        );
}

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

function getAllProducts(recipe_external_id, callback = console.log) {
    getNestedRecipes(recipe_external_id, (status, recipeIds) => {
        if (status == true) {

            recipeIds.push(recipe_external_id);
            getProductIdsForRecipies(recipeIds, [], callback);


        }
    });
}



function getProductIdsForRecipies(recipeIds, result, callback = console.log) {
    if (recipeIds.length == 0) {
        return callback(result);
    } else {
        getProductIds(recipeIds[0], (status, products) => {
            getProductIdsForRecipies(recipeIds.slice(1), result.concat(products), callback)
        })

    }

}


function consumeItem(quantity, recipe_external_id) {
    getAllProducts(recipe_external_id, (products) => {
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




function consumeProduct(productId, quantityAmount, callback = console.log) {
    let httpReq = config.grocy.url + "/api/stock/products/" + productId + "?GROCY-API-KEY=" + config.grocy.apiKey;
    fetch(httpReq)
        .then(res => res.json())
        .then(
            json => {

                let stock_amount = json.stock_amount;
                let consume_amount = quantityAmount < stock_amount ? quantityAmount : stock_amount;
                httpReq = config.grocy.url + "/api/stock/products/" + productId + "/consume" + "?GROCY-API-KEY=" + config.grocy.apiKey;
                let body = {
                    "amount": consume_amount,
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
                    .then(function (res) { callback(true, consume_amount)})
                    .catch(function (res) {callback(false, 0) })




            },
            err => {console.log("failed",err);callback(false, err)}
        );
}


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

