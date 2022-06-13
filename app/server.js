var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');

var app = express();
require('log-timestamp');

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason)
  });

  process.on('uncaughtException', err => {
      console.log("unhandled Exception:", err);

  })

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



//-------------logging--------------
var morgan = require('morgan')
var path = require('path')
var rfs = require('rotating-file-stream') // version 2.x

morgan.token('remote-user', function (req, res) { let session=loginHandler.getSession(req); if(session) {return session.userId} else {return ""}});

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '7d', // rotate daily
    path: path.join('log')
  })
  
  // setup the logger
  app.use(morgan('common', { stream: accessLogStream }))
  



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

var mailManager=require("./MailManager");


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


app.get("/bonSummary",(req,res) => {
    if (!loginHandler.haveRoles(req, ["ADMIN"], "ALL")) {
        res.sendStatus(401);
        return;
    }

    res.json(db.getBonSummary());
})


app.get("/bonSummary/:id",(req,res) => {
    if (!loginHandler.haveRoles(req, ["ADMIN"], "ALL")) {
        res.sendStatus(401);
        return;
    }
    let bonId=req.params.id;
    res.json(db.getBonSummary(bonId));
})


app.get("/bonSummaryFile",(req,res) => {
    /*if (!loginHandler.haveRoles(req, ["ADMIN"], "ALL")) {
        res.sendStatus(401);
        return;
    }*/


    let rows=[];
    let headers=[
        "Id",
        "Leveringsdato",
        "Status",
        "Pax",
        "Køkkenet vælger",
        "Leveringsadresse",
        "Navn",
        "Mail",
        "Telefon",
        "Firma",
        "EAN",
        "Betaling",
        "Priskategorie",
        "Købspris",
        "Pris"
    ];
    rows.push("\""+headers.join('";"')+"\"");
    let bons=db.getBonSummary();
    bons.forEach(b=>{
        let r=[
            "#"+b.id,
            new Date(b.delivery_date).toLocaleString(),
            b.status,
            b.nr_of_servings,
            b.kitchen_selects?"Ja":"Nej",
            b.customer_collects?"Afhentes":b.delivery_adr,
            b.name,
            b.email,
            b.phone_nr,
            b.company,
            b.ean_nr,
            b.payment_type,
            b.price_category,
            b.cost_price?b.cost_price.toFixed(2):0,
            b.price?b.price.toFixed(2):0
        ]
        rows.push("\""+r.join('";"')+"\"");
   })
   res.header('Content-Type', 'text/csv');
   res.header('Content-Encoding: utf-8');
   res.charset = 'utf-8';


   res.send(rows.join("\n"));
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
    db.searchBons(req.query,req.query.includeOrders=="true",function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("searchBons",items);
            res.sendStatus(404);  

        }
    })   
})


app.post("/sendBonMail/",(req,res) => {
    if (!loginHandler.haveRoles(req, ["ADMIN"], "ALL")) {
        res.sendStatus(401);
        return;
    }

    let message=req.body.message;
    let subject="#Bon:"+config.bonPrefix+"-"+req.body.bonId+":";
    let to=req.body.email;

    mailSender.sendMail(config.mail.user,to,undefined,undefined,subject,message,undefined, function(err) {
        if(err!==null) {
            console.log(err);
            res.sendStatus(500);
        } else {
            
            mailSender.sendMail(config.mail.user,config.mail.user,undefined,undefined,"SENT:"+subject,message,undefined, function(err) {
                if(err!==null) {
                    console.log(err);
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });          
        }
    });

})

app.get("/bonMails/:id",(req,res) => {
    if (!loginHandler.haveRoles(req, ["ADMIN"], "ALL")) {
        res.sendStatus(401);
        return;
    }
    let id=req.params.id;
    let markAsRead=true;
    mailManager.getBonMails(config.bonPrefix,id,markAsRead,(status,mails)=>{
        if(status) { 
            res.json(mails); 
        } else {
            console.log("get BonMails",mails);
            res.sendStatus(500);  

        }        
    })
})


function mailIncomingOrders(orders,callback) {
    if(orders.length===0) {
        callback(true);
        return;
    }
    let order=orders.shift();
    let subject="#Bon:"+config.bonPrefix+"-"+order.bonId+":";
    let message=order.orgMessage;

    mailSender.sendMail(config.mail.user,config.mail.user,undefined,undefined,"INCOMING:"+subject,message,undefined, function(err) {
        if(err!==null) {
            console.log("mailIncomingOrders",err);
            callback(false,err)
        } else {
            mailIncomingOrders(orders,callback)
        }
    });          
}


function manageIncomingOrders(callback) {
    if(config.mailManager.incomingMails) {
        mailManager.getIncomingOrders(config.mailManager.incomingMails.subjectContains,(status,orders)=>{
            if(status) {
                let mailOrders=[];
                orders.forEach(o=>{
                    let bonId=db.createBon(o.bon,null);
                    mailOrders.push({bonId:bonId,orgMessage:o.orgMessage});
                })
                mailIncomingOrders(mailOrders,callback);
            } else {
                callback(status);
            }
        });
    } else {
        callback(true);
    }
}

app.get("/checkIncomingOrders",(req,res)=> {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    manageIncomingOrders((status,err)=>{
        if(!status) {
           console.log("checkIncomingOrders",err);
        }
        res.sendStatus(200);
    })


})


app.get("/UnseenBonIdMails",(req,res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }

        mailManager.getUnseenMails(config.bonPrefix,(status,mails) => {
            if(status) { 
                res.json(mailManager.getBonIds(mails)); 
            } else {
                console.log("getUnseenMails",mails);
                res.sendStatus(500);  
    
            }        
        });
})
