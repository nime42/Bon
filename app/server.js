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







app.use(express.static('public'));


if(config.app.http) {
    var httpServer = http.createServer(app);
    httpServer.listen(config.app.http,() => console.log('App listening at http://localhost:'+config.app.http));
}
if(config.app.https) {
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(config.app.https,() => console.log('App listening at https://localhost:'+config.app.https));
}

var DBClass=require('./DBClass.js');
var DB=new DBClass('./resources/bon.db');


var mailSender=require("./mailSender.js");
mailSender.init(config.mail);

var mailManager=require("./MailManager");


var grocyFunctions=require("./GrocyFunctions.js");
let grocyFuncs=new grocyFunctions(config);

var OtherBonsHandler=require('./OtherBonsHandler.js');
var allBonInstances=new OtherBonsHandler(config,DB,grocyFuncs);

var loginHandler=require("./LoginHandler/loginHandler");


loginHandler.init(app,config.userDB,mailSender.sendMail,config.forgotPasswordMailTemplate);

loginHandler.resumeSessions();

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
  



var iZettleFunctions=require("./IzettleFunctionsClass.js");


var IZettleHandler=new iZettleFunctions(config,DB,grocyFuncs);

if(config.iZettle?.check_frequence) {
    IZettleHandler.checkPurchases(config.iZettle.check_frequence)
}



app.use((req,res,next)=>{
    if(!loginHandler.isLoggedIn(req) && req.url.startsWith("/api")) {
        res.sendStatus(401);
    } else {
        next();
    }
})

var vismaConfig=null;
try {
    vismaConfig=require('../resources/vismaConfig.js');
} catch(error) {
    console.log("VismaConfig.js is missing")
}
var VismaFunctions=require("./VismaFunctions.js");
const { otherBons } = require('../resources/config.js');
var Visma=new VismaFunctions(vismaConfig,DB);
//Visma.createInvoiceDraft(1022);
//Visma.getCustomer("lasc@kea.dk","KEA");




app.get("/shutdown",(req,res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    var isLocal = (ip.match(/(.*127.0.0.1)|::1/)); //not sure this always work when going through nginx
    if(isLocal) {
        loginHandler.saveSessions();
        console.log("Shutting down!");
        res.sendStatus(200);
        process.exit();
    } else {
        res.sendStatus(403);
    }

})


app.get("/api/bons",(req,res) => {
    let year=req.query.year;
    let month=req.query.month;
    DB.getBons(year,month,function(status,bons){
        if(status) { 
            res.json(bons); 
        } else {
            console.log("bons",bons);
            res.sendStatus(404);  

        }
    })   
})


app.get("/api/bonSummary",(req,res) => {
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }

    res.json(DB.getBonSummary());
})


app.get("/api/bonSummary/:id",(req,res) => {
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }
    let bonId=req.params.id;
    res.json(DB.getBonSummary(bonId));
})


app.get("/api/bonSummaryFile",(req,res) => {
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }


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
        "Pris",
        "Fakturadato",
    ];

    const excel = require('excel4node');
    const workbook = new excel.Workbook({
        dateFormat: 'YYYY-MM-DD hh:mm'
    });
    let headerStyle = workbook.createStyle({
        font: {
          bold: true
        }
      });
    const worksheet = workbook.addWorksheet('Sheet 1');
    worksheet.column(2).setWidth(18);
    worksheet.column(16).setWidth(18);
    let row=1;
    let col=1;
    headers.forEach(h => {
        worksheet.cell(row, col++).string(h).style(headerStyle);
    });

    let bons=DB.getBonSummary();
    bons.forEach(b=>{
        col=1;
        row++;
        worksheet.cell(row, col++).string("#"+config.bonPrefix+"-"+b.id);

        if(b.delivery_date) {
            worksheet.cell(row, col++).date(new Date(b.delivery_date));
        } else {
            worksheet.cell(row, col++).string("");
        }
        worksheet.cell(row, col++).string(b.status);
        if(!isNaN(b.nr_of_servings)) {
            worksheet.cell(row, col++).number(b.nr_of_servings?b.nr_of_servings:0);
        } else {
            worksheet.cell(row, col++).string(b.nr_of_servings?b.nr_of_servings:"0");
        }
        worksheet.cell(row, col++).string(b.kitchen_selects?"Ja":"Nej");
        worksheet.cell(row, col++).string(b.customer_collects?"Afhentes":b.delivery_adr);
        worksheet.cell(row, col++).string(b.name);
        worksheet.cell(row, col++).string(b.email);
        worksheet.cell(row, col++).string(b.phone_nr);
        worksheet.cell(row, col++).string(b.company);
        worksheet.cell(row, col++).string(b.ean_nr);
        worksheet.cell(row, col++).string(b.payment_type!=null?b.payment_type:'');
        worksheet.cell(row, col++).string(b.price_category);
        worksheet.cell(row, col++).number(b.cost_price?(Math.round(b.cost_price*100)/100):0);
        worksheet.cell(row, col++).number(b.price?(Math.round(b.price*100)/100):0);
        if(b.invoice_date) {
            worksheet.cell(row, col++).date(new Date(b.invoice_date));
        } else {
            worksheet.cell(row, col++).string("");
        }
        

   })
   workbook.write('bons.xlsx',res);
})

/**
 * Get all products (items) with their different price categories and cost price
 * @param {*} callback 
 */
function getProducts(callback=console.log) {
    DB.getItems(function(status,items){
        if(status) { 
            DB.getItemPrices(function(status,prices) {
                if(status) {
                    let item_lookUpPrices={};
                    prices.items.forEach(p=>{
                        item_lookUpPrices[p.id]=p;
                    })
                    let headers=["Kategorie","Vare","Pris",...prices.categoryNames.map(e=>("Pris - "+e))];
                    let rows=[];
                    rows.push(headers);
                    items.filter(e=>(e.sellable===1)).forEach(i=>{
                        let row=[];
                        row.push(i.category);
                        row.push(i.name);
                        row.push(i.cost_price);
                        let categoryPrices=item_lookUpPrices[i.id];
                        prices.categoryNames.forEach(n=>{
                            row.push(categoryPrices.price_categories[n]);
                        })
                        rows.push(row);
                    })
                    callback(true,rows);
                } else {
                    callback(false,prices);
                }
            })
        } else {
            callback(false,items);
        }
    })  

}


app.get("/api/productFile", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }

    getProducts((status, rows) => {
        if (status) {
            const excel = require('excel4node');
            const workbook = new excel.Workbook();
            let headerStyle = workbook.createStyle({
                font: {
                    bold: true
                }
            });
            try {
            const worksheet = workbook.addWorksheet('Sheet 1');
            let headers = rows[0];
            let row = 1;
            let col = 1;
            headers.forEach(h => {
                worksheet.cell(row, col++).string(h).style(headerStyle);
            });
            row++;
            rows.slice(1).forEach(r=>{
                col=1;
                r.forEach(v=>{
                    if(!isNaN(v)) {
                        worksheet.cell(row, col++).number(+Number(v).toFixed(2));
                    } else {
                        worksheet.cell(row, col++).string(v);
                    }  
                })
                row++;
            })
            workbook.write('products.xlsx',res);
        } catch(err) {
            console.log("get productFile failed",err);
            res.sendStatus(500);
        }
        } else {
            res.sendStatus(404);
        }

    })


})


app.post("/api/bons",(req,res) => {
    DB.createBon(req.body,function(status,msg) {
        if(status) {  
            res.json(msg);
 
        } else {
            console.log("createbon",msg);
            res.sendStatus(500);  

        }
    });
})

app.put("/api/bons/:id",(req,res) => {
    DB.updateBon(req.params.id,req.body,function(status,msg) {
        if(status) {  
            res.json(msg);
 
        } else {
            console.log("updateBon",msg);
            res.sendStatus(500);  

        }
    });
})

app.put("/api/bonStatus/:id",(req,res) => {
    DB.updateBonStatus(req.params.id,req.body.status,function(status,msg) {
        if(status) {  
            res.sendStatus(200);
 
        } else {
            console.log("updateBon",msg);
            res.sendStatus(500);  

        }
    });
})

app.delete("/api/bons/:id",(req,res) => {

    DB.delBon(req.params.id,function(status,err){
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("deletebon",err);
            res.sendStatus(500);  

        }
    })       

})


app.put("/api/consumeBon/:id",(req,res) => {
    DB.getOrders(req.params.id,function(status,items){
        items.forEach(i => {
            grocyFuncs.consumeRecipy(i.quantity,i.external_id); 
        });
    });  


    res.sendStatus(200);  

})



app.get("/api/customers",(req,res) => {
    let email=req.query.email;
    DB.getCustomers(email,function(status,customers){
        if(status) { 
            res.json(customers); 
        } else {
            console.log("getCustomers",customers);
            res.sendStatus(500);  

        }
    })   
})

app.get("/api/getGrocyRecipes",(req,res) => {
    grocyFuncs.getAllRecipes(function(recipes){
            res.json(recipes); 
    })   
})


app.get("/api/items",(req,res) => {

    DB.getItems(function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("getitems",items);
            res.sendStatus(404);  

        }
    })   
})

app.get("/api/iZettleProducts",(req,res) => {

    IZettleHandler.getProductList(function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("getProductList",items);
            res.sendStatus(404);  
        }
    })   
})

app.put("/api/izettleProduct/:id",(req,res)=>{
    let product_id=req.params.id;
    let grocy_id=req.body.grocy_id;
    let quantity=req.body.quantity;
    let connectable=req.body.connectable;
    IZettleHandler.updateProduct(product_id,grocy_id,quantity,connectable);
    res.sendStatus(200);

})


app.get("/api/items_prices",(req,res) => {

    DB.getItemPrices(function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("getitems",items);
            res.sendStatus(404);  

        }
    })   
})


app.get("/api/orders/:id",(req,res) => {

    DB.getOrders(req.params.id,function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("getitems",items);
            res.sendStatus(404);  

        }
    })   
})

app.put("/api/orders/:id",(req,res) => {
    DB.saveOrders(req.params.id,req.body);
    res.sendStatus(200);
})


app.put("/api/items",(req,res) => {
    let items=req.body;
    DB.updateItems(items,function(status,err){
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("updateItems",err);
            res.sendStatus(500);  

        }
    })  
})

app.delete("/api/items/:id",(req,res) => {
    DB.deleteItems(req.params.id,function(status,err){
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("deleteItems",err);
            res.sendStatus(500);  

        }
    })  
})

app.get("/api/updateDB", (req, res) => {
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }
    grocyFuncs.updateCache(()=>{
        grocyFuncs.getAllRecipes(recipies=>{
            DB.updateItems(recipies, function (status, err) {
                if (status) {

                    //Update all other boninstances also
                    Object.values(allBonInstances.getAllInstances()).forEach(i=>{
                        if(i.grocy!==grocyFuncs) {
                            console.log("updating grocy for",i.grocy.config.grocy.url);
                            i.grocy.updateCache();
                        }
                    })


                    res.sendStatus(200);
                } else {
                    console.log("updateDB updateItems", err);
                    res.sendStatus(500);
                }
            });
        })
    })


});

app.get("/api/searchBons",(req,res) => {
    DB.searchBons(req.query,req.query.includeOrders=="true",function(status,items){
        if(status) { 
            res.json(items); 
        } else {
            console.log("searchBons",items);
            res.sendStatus(404);  

        }
    })   
})


app.post("/api/sendBonMail/",(req,res) => {
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }



    let id=req.body.bonId;
    id=id.toString();
    let prefix=config.bonPrefix;
    if(id.match(/.+-\d+/)) {
        [prefix,id]=id.split("-");
    }



    let message=req.body.message;
    let subject="#Bon:"+prefix+"-"+id+":";
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

app.get("/api/bonMails/:id",(req,res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let id=req.params.id;
    let prefix=config.bonPrefix;
    if(id.match(/.+-\d+/)) {
        [prefix,id]=id.split("-");
    }
    let markAsRead=true;
    mailManager.getBonMails(prefix,id,markAsRead,(status,mails)=>{
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

let isManagingIncomingOrders=false;
function manageIncomingOrders(callback) {
    if (isManagingIncomingOrders) {
        callback(true);
        return;
    }

    if (config.mailManager.incomingMails) {
        try {
            isManagingIncomingOrders = true;
            mailManager.getIncomingOrders(config.mailManager.incomingMails.subjectContains, (status, orders) => {
                if (status) {
                    let mailOrders = [];
                    orders.forEach(o => {
                        let bonId = DB.createBon(o.bon, null);
                        mailOrders.push({ bonId: bonId, orgMessage: o.orgMessage });
                    })
                    mailIncomingOrders(mailOrders, callback);
                } else {
                    callback(status);
                }
                
            });
        } catch (err) {
            console.log("something went wrong in manageIncomingOrders",err);
        } finally {
            isManagingIncomingOrders = false;
        }

    } else {
        callback(true);
    }
}

if(config.mailManager.incomingMails) {

    let checkPeriod=parseInt(config.mailManager.incomingMails.checkPeriodic);
    if(!Number.isInteger(checkPeriod)) {
        console.error("Can't check incoming mails: config.mailManager.incomingMails.checkperiodic is not a number or is missing!");
    }
    manageIncomingOrders((status)=>{
        console.log("checking incoming mails,status:"+status);
    });

    
    setInterval(()=>{
        manageIncomingOrders((status)=>{
            console.log("checking incoming mails,status:"+status);
        })
    },checkPeriod*1000*60);
}

app.get("/api/checkIncomingMails",(req,res)=>{
    if(config.mailManager.incomingMails) {
        manageIncomingOrders((status)=>{
            console.log("checking incoming mails,status:"+status);
        });
    }
    res.sendStatus(200);

})

app.get("/api/unseenBonIdMails",(req,res) => {
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


app.get("/api/allBonWithMails",(req,res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    let mailsSince=undefined;
    if(req.query.mailsSince!=="") {
        mailsSince=new Date(req.query.mailsSince);
    }
    mailManager.getBonWithMails("*",mailsSince,(status,mails) => {
        mails.forEach(m=>{
            let searchParams={bonId:m.bonId};
            let [bon]=allBonInstances.searchBons(m.prefix,searchParams,true,null);
            m.bon=bon;
        })
        res.json(mails.filter((m)=>(m.bon!==undefined)));
    });
})






app.get("/api/allUnseenBonIdMails",(req,res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }

        mailManager.getUnseenMails("*",(status,mails) => {
            if(status) { 
                res.json(mailManager.getBonIds(mails,true)); 
            } else {
                console.log("getUnseenMails",mails);
                res.sendStatus(500);  
    
            }        
        });
})


app.get("/api/getBonsForWeek",(req,res)=>{
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }
    let monday=new Date(req.query.monday);
    try {
        let bons=allBonInstances.getBonsForWeek(monday,null);
        res.json(bons);
    } catch(err) {
        console.log("getBonsForWeek",err);
        res.sendStatus(500);  
    }

})

app.get("/api/checkStock",(req,res)=>{
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }

    //Don't do this now
    res.json([]);
    return;

    allBonInstances.checkStock((status,bons) =>{
        if(status) {
            res.json(bons);
        } else {
            console.log("checkStock",bons);
            res.sendStatus(500);  
    
        }

    })


})


app.get("/api/messages",(req,res) => {

    DB.getMessages(function(status,messages){
        if(status) { 
            res.json(messages); 
        } else {
            console.log("getMessages",messages);
            res.sendStatus(404);  

        }
    })   
})



app.post("/api/messages",(req,res) => {
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }    

    let message=req.body;

    DB.createMessage(message,function(status,message){
        if(status) { 
            res.json(message); 
        } else {
            console.log("createMessage",message);
            if(message=="SQLITE_CONSTRAINT_UNIQUE") {
                res.sendStatus(409);  
            } else {
                res.sendStatus(500);  
            }
        }
    })   
})


app.put("/api/messages/:id",(req,res) => {
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }


    let message=req.body;
    let id=req.params.id;

    DB.updateMessages(id,message,function(status,err){
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("updateMessage",err);
            res.sendStatus(500);  

        }
    })  
})

app.delete("/api/messages/:id",(req,res) => {
    if(!loginHandler.checkRoles(req,"${ADMIN}")) {
        res.sendStatus(401);
        return;        
    }
    let id=req.params.id;
    DB.deleteMessage(id,function(status,err){
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("deleteMessage",err);
            res.sendStatus(500);  

        }
    })
    
})


app.put("/api/notifyBon/:id",(req,res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let bonId=req.params.id;
    let userId=loginHandler.getSession(req).userId;
    DB.notifyBon(userId,bonId, (status)=>{
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("notifyBon: something went wrong");
            res.sendStatus(500);  
        }
    })
})

app.put("/api/seeBon/:id",(req,res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let bonId=req.params.id;
    let userId=loginHandler.getSession(req).userId;
    DB.seeBon(userId,bonId, (status)=>{
        if(status) { 
            res.sendStatus(200);  
 
        } else {
            console.log("seeBon: something went wrong");
            res.sendStatus(500);  
        }
    })
})

app.get("/api/getNotifiedBon",(req,res) =>{
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let userId=loginHandler.getSession(req).userId;
    DB.getNotifiedBon(userId,(status,bonId)=>{
        if(status) {
            res.json(bonId); 
        } else {
            res.sendStatus(404);
        }
    })



})




app.post("/api/getGrocyProductsForOrders", (req, res) => {
  if (!loginHandler.isLoggedIn) {
    res.sendStatus(401);
    return;
  }
  if (req.body.orders) {
    let bonId=req.body.bonId;
    let orders = req.body.orders;
    allBonInstances.getGrocyProductsForOrders(bonId,orders,(status,orders)=>{
        if(status) {
            res.json(orders);
        } else {
            console.log("getGrocyProductsForOrders, something went wrong", orders);
            res.sendStatus(500);
        }
    });
  }
});

app.post("/api/createInvoiceDraft", (req, res) => {});

  


