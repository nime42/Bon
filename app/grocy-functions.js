const config=require('../resources/config.js');
const fetch = require('node-fetch'); 

function getAllRecipes(callback=console.log) {
    let httpReq = config.grocy.url+"/api/objects/recipes?GROCY-API-KEY="+config.grocy.apiKey;
    console.log(httpReq);

    fetch(httpReq)
    .then(res => res.json())
    .then(
        json => {
            callback(true,parseRecipes(json));
        },
        err => callback(false, err)
    );
}

function parseRecipes(recipes) {
    return recipes.map(r => {
        let salesPrices={};
        Object.keys(r.userfields).filter(k=>(k.match(/^Salesprice.*/)!=null)).forEach(k=>{
            let priceCategory=k.replace("Salesprice","");
            salesPrices[priceCategory]=r.userfields[k];
        });

        return {
            name:r.name,
            category:r.userfields?r.userfields.grupper:"",
            cost_price:r.userfields?r.userfields.costprice:"",
            sellable:r.userfields?r.userfields.sellable:"",
            sellableZettle:r.userfields?r.userfields.sellableZettle:"",
            external_id:r.id,
            salesPrices:salesPrices
        }
    }
    );
            
}

module.exports={
    getAllRecipes:getAllRecipes
}

