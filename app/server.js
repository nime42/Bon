var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');

var app = express();

var config=require('../resources/config.js');

if(config.app.https) {
    var privateKey  = fs.readFileSync(config.certs.privateKey, 'utf8');
    var certificate = fs.readFileSync(config.certs.certificate, 'utf8');
    var ca = fs.readFileSync(config.certs.ca, 'utf8');
}

var credentials = {key: privateKey, cert: certificate,ca:ca};
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('public'));


if(config.app.http) {
    var httpServer = http.createServer(app);
    httpServer.listen(config.app.http,() => console.log('App listening at http://localhost:'+config.app.http));
}
if(config.app.https) {
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(config.app.https,() => console.log('App listening at https://localhost:'+config.app.https));
}

var db=require('./db-functions.js');

var grocy=require('./grocy-functions.js');

var mailSender=require("./mailSender.js");
mailSender.init(config.mail);

var loginHandler=require("./LoginHandler/loginHandler");

loginHandler.init(app,config.userDB,mailSender.sendMail,config.forgotPasswordMailTemplate);


app.get("/shutdown",(req,res) => {
    var isLocal = (req.connection.localAddress === req.connection.remoteAddress);
    if(isLocal) {
        console.log("Shutting down!");
        res.sendStatus(200);
        process.exit();
    }

})


app.get("/bons",(req,res) => {
    let year=req.query.year;
    let month=req.query.month;
    db.getBons(year,month,function(status,bons){
        if(status) { 
            res.json(bons); 
        } else {
            console.log("bons",bons);
            res.sendStatus(404);  

        }
    })   
})

app.post("/bons",(req,res) => {
    db.createBon(req.body,function(status,msg) {
        if(status) {  
            res.json(msg);
 
        } else {
            console.log("createbon",msg);
            res.sendStatus(500);  

        }
    });
})

app.put("/bons/:id",(req,res) => {
    console.log(req);
    db.updateBon(req.params.id,req.body,function(status,msg) {
        if(status) {  
            res.json(msg);
 
        } else {
            console.log("updateBon",msg);
            res.sendStatus(500);  

        }
    });
})

app.put("/bonStatus/:id",(req,res) => {
    db.updateBonStatus(req.params.id,req.body.status,function(status,msg) {
        if(status) {  
            res.sendStatus(200);
 
        } else {
            console.log("updateBon",msg);
            res.sendStatus(500);  

        }
    });
})

app.delete("/bons/:id",(req,res) => {

    db.delBon(req.params.id,function(status,err){
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("deletebon",err);
            res.sendStatus(500);  

        }
    })       

})


app.put("/consumeBon/:id",(req,res) => {
    consumeBon(req.params.id);
    res.sendStatus(200);  

})

function consumeBon(id) {
    db.getOrders(id,function(status,items){
        items.forEach(i => {
            grocy.consumeItem(i.quantity,i.external_id);
            
        });
    });   
}


app.get("/customers",(req,res) => {
    let email=req.query.email;
    db.getCustomers(email,function(status,customers){
        if(status) { 
            res.json(customers); 
        } else {
            console.log("getCustomers",customers);
            res.sendStatus(500);  

        }
    })   
})

app.get("/getGrocyRecipes",(req,res) => {
    grocy.getAllRecipes(function(status,recipes){
        if(status) { 
            res.json(recipes); 
        } else {
            console.log("grocyRecipes",recipes);
            res.sendStatus(500);  

        }
    })   
})


app.get("/items",(req,res) => {

    db.getItems(function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("getitems",items);
            res.sendStatus(404);  

        }
    })   
})


app.get("/items_prices",(req,res) => {

    db.getItemPrices(function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("getitems",items);
            res.sendStatus(404);  

        }
    })   
})


app.get("/orders/:id",(req,res) => {

    db.getOrders(req.params.id,function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("getitems",items);
            res.sendStatus(404);  

        }
    })   
})

app.put("/orders/:id",(req,res) => {
    db.saveOrders(req.params.id,req.body);
    res.sendStatus(200);
})


app.put("/items",(req,res) => {
    let items=req.body;
    db.updateItems(items,function(status,err){
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("updateItems",err);
            res.sendStatus(500);  

        }
    })  
})

app.delete("/items/:id",(req,res) => {
    db.deleteItems(req.params.id,function(status,err){
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("deleteItems",err);
            res.sendStatus(500);  

        }
    })  
})

app.get("/updateDB", (req, res) => {
    if (!loginHandler.haveRoles(req, ["ADMIN"], "ALL")) {
        res.sendStatus(401);
        return;
    }
    grocy.getAllRecipes((status, data) => {
        if (status) {
            db.updateItems(data, function (status2, err) {
                if (status2) {
                    res.sendStatus(200);
                } else {
                    console.log("updateDB updateItems", err);
                    res.sendStatus(500);
                }
            });
        } else {
            console.log("updateDB getAllRecepies", err);
            res.sendStatus(500);

        }
    });
});

app.get("/searchBons",(req,res) => {
    db.searchBons(req.query,function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("searchBons",items);
            res.sendStatus(404);  

        }
    })   
})






