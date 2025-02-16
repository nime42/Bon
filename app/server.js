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

var config = require('../resources/config.js');



if (config.app.https) {
    var privateKey = fs.readFileSync(config.certs.privateKey, 'utf8');
    var certificate = fs.readFileSync(config.certs.certificate, 'utf8');
    var ca = fs.readFileSync(config.certs.ca, 'utf8');
}

var credentials = { key: privateKey, cert: certificate, ca: ca };
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies







app.use(express.static('public'));


if (config.app.http) {
    var httpServer = http.createServer(app);
    httpServer.listen(config.app.http, () => console.log('App listening at http://localhost:' + config.app.http));
}
if (config.app.https) {
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(config.app.https, () => console.log('App listening at https://localhost:' + config.app.https));
}

var DBClass = require('./DBClass.js');
var DB = new DBClass('./resources/bon.db');

var AddressFunctions = require('./AddressFunctions.js');
var addressFunctions = new AddressFunctions(config);
DB.useAddressLookUp(addressFunctions);
var mailSender = require("./mailSender.js");
mailSender.init(config.mail);

var mailManager = require("./MailManager");


var grocyFunctions = require("./GrocyFunctions.js");
let grocyFuncs = new grocyFunctions(config);

var OtherBonsHandler = require('./OtherBonsHandler.js');
var allBonInstances = new OtherBonsHandler(config, DB, grocyFuncs);

var loginHandler = require("./LoginHandler/loginHandler");


loginHandler.init(app, config.userDB, mailSender.sendMail, config.forgotPasswordMailTemplate);

loginHandler.resumeSessions();

//-------------logging--------------
var morgan = require('morgan')
var path = require('path')
var rfs = require('rotating-file-stream') // version 2.x
morgan.token('remote-user', function (req, res) { let session = loginHandler.getSession(req); if (session) { return session.userId } else { return "" } });
// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '7d', // rotate daily
    path: path.join('log')
})

// setup the logger
app.use(morgan('common', { stream: accessLogStream }))




var iZettleFunctions = require("./IzettleFunctionsClass.js");


var IZettleHandler = new iZettleFunctions(config, DB, grocyFuncs);

if (config.iZettle?.check_frequence) {
    IZettleHandler.checkPurchases(config.iZettle.check_frequence)
}



app.use((req, res, next) => {
    if (!loginHandler.isLoggedIn(req) && req.url.startsWith("/api")) {
        loginHandler.fromBasicAuth(req, res, (status, req, res) => {
            if (status) {
                next();
            } else {
                res.sendStatus(401);
            }
        });
    } else {
        next();
    }
})

var vismaConfig = null;
try {
    vismaConfig = require('../resources/vismaConfig.js');
} catch (error) {
    console.log("VismaConfig.js is missing")
}
var VismaFunctions = require("./VismaFunctions.js");
const { otherBons } = require('../resources/config.js');
const BonUtils = require('./BonUtils.js');
var Visma = new VismaFunctions(vismaConfig, DB);
//Visma.createInvoiceDraft(1022);
//Visma.getCustomer("lasc@kea.dk","KEA");




app.get("/shutdown", (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    var isLocal = (ip.match(/(.*127.0.0.1)|::1/)); //not sure this always work when going through nginx
    if (isLocal) {
        loginHandler.saveSessions();
        console.log("Shutting down!");
        res.sendStatus(200);
        process.exit();
    } else {
        res.sendStatus(403);
    }

})


app.get("/api/bons", (req, res) => {
    let year = req.query.year;
    let month = req.query.month;
    DB.getBons(year, month, function (status, bons) {
        if (status) {
            res.json(bons);
        } else {
            console.log("bons", bons);
            res.sendStatus(404);

        }
    })
})


app.get("/api/bonSummary", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }

    res.json(DB.getBonSummary());
})


app.get("/api/bonSummary/:id", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }
    let bonId = req.params.id;
    res.json(DB.getBonSummary(bonId));
})


app.get("/api/bonSummaryFile", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }

    let safeString = (string) => {
        if (string === undefined || string === null) {
            return ""
        } else {
            return string;
        }
    }

    let safeNumber = (num) => {

        if (typeof num === 'number') {
            return Math.round(num * 100) / 100;
        }

        if (num === undefined || num === null) {
            return 0;
        }
        num = num.replace(",", ".");
        num = Number(num);
        if (isNaN(num)) {
            return 0;
        } else {
            return Math.round(num * 100) / 100;
        }

    }


    let rows = [];
    let headers = [
        "Id",
        "Leveringsdato",
        "Status",
        "Pax",
        "Pax-enheter",
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
        "afstand (km)"
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
    const worksheet = workbook.addWorksheet('Bons');
    worksheet.column(2).setWidth(18);
    worksheet.column(16).setWidth(18);
    let row = 1;
    let col = 1;
    headers.forEach(h => {
        worksheet.cell(row, col++).string(h).style(headerStyle);
    });

    let bons = DB.getBonSummary();
    let distanceLookup = {}
    bons.forEach(b => {
        distanceLookup[b.id] = b.distance;
    })
    bons.forEach(b => {
        col = 1;
        row++;
        worksheet.cell(row, col++).string(safeString("#" + config.bonPrefix + "-" + b.id));

        if (b.delivery_date) {
            worksheet.cell(row, col++).date(new Date(b.delivery_date));
        } else {
            worksheet.cell(row, col++).string("");
        }
        worksheet.cell(row, col++).string(safeString(b.status));
        worksheet.cell(row, col++).number(safeNumber(b.nr_of_servings));
        worksheet.cell(row, col++).string(b.pax_units);


        worksheet.cell(row, col++).string(b.kitchen_selects ? "Ja" : "Nej");
        worksheet.cell(row, col++).string(b.customer_collects ? "Afhentes" : safeString(b.delivery_adr));
        worksheet.cell(row, col++).string(safeString(b.name));
        worksheet.cell(row, col++).string(safeString(b.email));
        worksheet.cell(row, col++).string(safeString(b.phone_nr));
        worksheet.cell(row, col++).string(safeString(b.company));
        worksheet.cell(row, col++).string(safeString(b.ean_nr));
        worksheet.cell(row, col++).string(safeString(b.payment_type));
        worksheet.cell(row, col++).string(safeString(b.price_category));
        worksheet.cell(row, col++).number(safeNumber(b.cost_price));
        worksheet.cell(row, col++).number(safeNumber(b.price));
        if (b.invoice_date) {
            worksheet.cell(row, col++).date(new Date(b.invoice_date));
        } else {
            worksheet.cell(row, col++).string("");
        }
        worksheet.cell(row, col++).number(+safeNumber(b.distance / 1000).toFixed(2));


    })

    const ordersWorksheet = workbook.addWorksheet('Orders');
    let orderHeaders = [
        "Bon-id",
        "Kategorie",
        "Produkt",
        "Antal",
        "Købspris",
        "Pris",
        "Extra info",
        "Afstand(km)"
    ];
    row = 1;
    col = 1;
    orderHeaders.forEach(h => {
        ordersWorksheet.cell(row, col++).string(h).style(headerStyle);
    });
    let orders = DB.getOrders();
    orders.forEach(o => {
        col = 1;
        row++;
        ordersWorksheet.cell(row, col++).string(safeString("#" + config.bonPrefix + "-" + o.bon_id));
        ordersWorksheet.cell(row, col++).string(safeString(o.category));
        ordersWorksheet.cell(row, col++).string(safeString(o.name));
        ordersWorksheet.cell(row, col++).number(safeNumber(o.quantity));
        ordersWorksheet.cell(row, col++).number(safeNumber(o.cost_price));
        ordersWorksheet.cell(row, col++).number(safeNumber(o.price));
        ordersWorksheet.cell(row, col++).string(safeString(o.special_request));
        if (o.category.match(/.*levering*./i)) {
            ordersWorksheet.cell(row, col++).number(+safeNumber(distanceLookup[o.bon_id] / 1000).toFixed(2));
        }
    });


    const allWorksheet = workbook.addWorksheet('Bons+Orders');
    allWorksheet.column(2).setWidth(18);
    allWorksheet.column(16).setWidth(18);
    let allHeaders = [
        "Id",
        "Leveringsdato",
        "Status",
        "Pax",
        "Pax-enheter",
        "Køkkenet vælger",
        "Leveringsadresse",
        "Navn",
        "Mail",
        "Telefon",
        "Firma",
        "EAN",
        "Betaling",
        "Priskategorie",
        "Købspris(totalt)",
        "Pris(totalt)",
        "Fakturadato",
        "Kategorie",
        "Produkt",
        "Antal",
        "Købspris(produkt)",
        "Pris(produkt)",
        "Extra info",
        "Afstand(km)"
    ];
    row = 1;
    col = 1;
    allHeaders.forEach(h => {
        allWorksheet.cell(row, col++).string(h).style(headerStyle);
    });


    let productInfoStyle = workbook.createStyle({
        fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: '#FFFF00',
            fgColor: '#FFFF00',
        }
    });

    let allInfo = DB.getBonsJoinedWithOrders();
    allInfo.forEach(b => {
        col = 1;
        row++;
        allWorksheet.cell(row, col++).string(safeString("#" + config.bonPrefix + "-" + b.id));

        if (b.delivery_date) {
            allWorksheet.cell(row, col++).date(new Date(b.delivery_date));
        } else {
            allWorksheet.cell(row, col++).string("");
        }
        allWorksheet.cell(row, col++).string(safeString(b.status));
        if (!isNaN(b.nr_of_servings)) {
            allWorksheet.cell(row, col++).number(safeNumber(b.nr_of_servings));
        } else {
            allWorksheet.cell(row, col++).string(safeString(b.nr_of_servings));
        }
        allWorksheet.cell(row, col++).string(b.pax_units);
        allWorksheet.cell(row, col++).string(b.kitchen_selects ? "Ja" : "Nej");
        allWorksheet.cell(row, col++).string(b.customer_collects ? "Afhentes" : b.delivery_adr);
        allWorksheet.cell(row, col++).string(safeString(b.name));
        allWorksheet.cell(row, col++).string(safeString(b.email));
        allWorksheet.cell(row, col++).string(safeString(b.phone_nr));
        allWorksheet.cell(row, col++).string(safeString(b.company));
        allWorksheet.cell(row, col++).string(safeString(b.ean_nr));
        allWorksheet.cell(row, col++).string(safeString(b.payment_type));
        allWorksheet.cell(row, col++).string(safeString(b.price_category));
        allWorksheet.cell(row, col++).number(safeNumber(b.cost_price));
        allWorksheet.cell(row, col++).number(safeNumber(b.price));
        if (b.invoice_date) {
            allWorksheet.cell(row, col++).date(new Date(b.invoice_date));
        } else {
            allWorksheet.cell(row, col++).string("");
        }

        allWorksheet.cell(row, col++).string(safeString(b.product_category)).style(productInfoStyle);
        allWorksheet.cell(row, col++).string(safeString(b.product)).style(productInfoStyle);
        allWorksheet.cell(row, col++).number(safeNumber(b.quantity)).style(productInfoStyle);
        allWorksheet.cell(row, col++).number(safeNumber(b.product_cost_price)).style(productInfoStyle);
        allWorksheet.cell(row, col++).number(safeNumber(b.product_price)).style(productInfoStyle);
        allWorksheet.cell(row, col++).string(safeString(b.special_request)).style(productInfoStyle);
        if (b.product_category.match(/.*levering*./i)) {
            allWorksheet.cell(row, col++).number(+safeNumber(distanceLookup[b.id] / 1000).toFixed(2)).style(productInfoStyle);
        }

    })




    workbook.write('bons.xlsx', res);
})

/**
 * Get all products (items) with their different price categories and cost price
 * @param {*} callback 
 */
function getProducts(callback = console.log) {
    DB.getItems(function (status, items) {
        if (status) {
            DB.getItemPrices(function (status, prices) {
                if (status) {
                    let item_lookUpPrices = {};
                    prices.items.forEach(p => {
                        item_lookUpPrices[p.id] = p;
                    })
                    let headers = ["Kategorie", "Vare", "Pris", ...prices.categoryNames.map(e => ("Pris - " + e))];
                    let rows = [];
                    rows.push(headers);
                    items.filter(e => (e.sellable === 1)).forEach(i => {
                        let row = [];
                        row.push(i.category);
                        row.push(i.name);
                        row.push(i.cost_price);
                        let categoryPrices = item_lookUpPrices[i.id];
                        prices.categoryNames.forEach(n => {
                            row.push(categoryPrices.price_categories[n]);
                        })
                        rows.push(row);
                    })
                    callback(true, rows);
                } else {
                    callback(false, prices);
                }
            })
        } else {
            callback(false, items);
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
                rows.slice(1).forEach(r => {
                    col = 1;
                    r.forEach(v => {
                        if (!isNaN(v)) {
                            worksheet.cell(row, col++).number(+Number(v).toFixed(2));
                        } else {
                            worksheet.cell(row, col++).string(v !== undefined ? v : "");
                        }
                    })
                    row++;
                })
                workbook.write('products.xlsx', res);
            } catch (err) {
                console.log("get productFile failed", err);
                res.sendStatus(500);
            }
        } else {
            res.sendStatus(404);
        }

    })


})


app.post("/api/bons", (req, res) => {
    DB.createBon(req.body, function (status, msg) {
        if (status) {
            res.json(msg);

        } else {
            console.log("createbon", msg);
            res.sendStatus(500);

        }
    });
})

app.put("/api/bons/:id", (req, res) => {
    DB.updateBon(req.params.id, req.body, function (status, msg) {
        if (status) {
            res.json(msg);

        } else {
            console.log("updateBon", msg);
            res.sendStatus(500);

        }
    });
})

app.patch("/api/bons/:id", (req, res) => {
    DB.patchBon(req.params.id, req.body, function (status, msg) {
        if (status) {
            res.json(msg);

        } else {
            console.log("patchBon", msg);
            res.sendStatus(500);

        }
    });
})

app.put("/api/bonStatus/:id", (req, res) => {
    DB.updateBonStatus(req.params.id, req.body.status, function (status, msg) {
        if (status) {
            res.sendStatus(200);

        } else {
            console.log("updateBon", msg);
            res.sendStatus(500);

        }
    });
})

app.delete("/api/bons/:id", (req, res) => {

    DB.delBon(req.params.id, function (status, err) {
        if (status) {
            res.sendStatus(200);

        } else {
            console.log("deletebon", err);
            res.sendStatus(500);

        }
    })

})


app.put("/api/consumeBon/:id", (req, res) => {
    DB.getOrders(req.params.id, function (status, items) {
        items.forEach(i => {
            grocyFuncs.consumeRecipy(i.quantity, i.external_id);
        });
    });


    res.sendStatus(200);

})



app.get("/api/customers", (req, res) => {
    let email = req.query.email;
    DB.getCustomers(email, function (status, customers) {
        if (status) {
            res.json(customers);
        } else {
            console.log("getCustomers", customers);
            res.sendStatus(500);

        }
    })
})

app.get("/api/getGrocyRecipes", (req, res) => {
    grocyFuncs.getAllRecipes(function (recipes) {
        res.json(recipes);
    })
})


app.get("/api/items", (req, res) => {

    DB.getItems(function (status, items) {
        if (status) {
            res.json(items);
        } else {
            console.log("getitems", items);
            res.sendStatus(404);

        }
    })
})

app.get("/api/iZettleProducts", (req, res) => {

    IZettleHandler.getProductList(function (status, items) {
        if (status) {
            res.json(items);
        } else {
            console.log("getProductList", items);
            res.sendStatus(404);
        }
    })
})

app.put("/api/izettleProduct/:id", (req, res) => {
    let product_id = req.params.id;
    let grocy_id = req.body.grocy_id;
    let quantity = req.body.quantity;
    let connectable = req.body.connectable;
    IZettleHandler.updateProduct(product_id, grocy_id, quantity, connectable);
    res.sendStatus(200);

})


app.get("/api/items_prices", (req, res) => {

    DB.getItemPrices(function (status, items) {
        if (status) {
            res.json(items);
        } else {
            console.log("getitems", items);
            res.sendStatus(404);

        }
    })
})


app.get("/api/orders/:id", (req, res) => {

    DB.getOrders(req.params.id, function (status, items) {
        if (status) {
            res.json(items);
        } else {
            console.log("getitems", items);
            res.sendStatus(404);

        }
    })
})

app.put("/api/orders/:id", (req, res) => {
    DB.saveOrders(req.params.id, req.body);
    res.sendStatus(200);
})


app.put("/api/items", (req, res) => {
    let items = req.body;
    DB.updateItems(items, function (status, err) {
        if (status) {
            res.sendStatus(200);

        } else {
            console.log("updateItems", err);
            res.sendStatus(500);

        }
    })
})

app.delete("/api/items/:id", (req, res) => {
    DB.deleteItems(req.params.id, function (status, err) {
        if (status) {
            res.sendStatus(200);

        } else {
            console.log("deleteItems", err);
            res.sendStatus(500);

        }
    })
})

app.get("/api/updateDB", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }
    grocyFuncs.updateCache(() => {
        grocyFuncs.getAllRecipes(recipies => {
            DB.updateItems(recipies, function (status, err) {
                if (status) {

                    //Update all other boninstances also
                    Object.values(allBonInstances.getAllInstances()).forEach(i => {
                        if (i.grocy !== grocyFuncs) {
                            console.log("updating grocy for", i.grocy.config.grocy.url);
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

app.get("/api/searchBons", (req, res) => {
    DB.searchBons(req.query, req.query.includeOrders == "true", function (status, items) {
        if (status) {
            res.json(items);
        } else {
            console.log("searchBons", items);
            res.sendStatus(404);

        }
    })
})


app.post("/api/sendBonMail/", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }



    let id = req.body.bonId;
    id = id.toString();
    let prefix = config.bonPrefix;
    if (id.match(/.+-\d+/)) {
        [prefix, id] = id.split("-");
    }



    let message = req.body.message;
    let subject = "#Bon:" + prefix + "-" + id + ":";
    let to = req.body.email;
    mailSender.sendMailWithReceipt(config.mail.user, to, undefined, undefined, subject, message, undefined, function (err) {
        if (err !== null) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    })


})

app.get("/api/bonMails/:id", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let id = req.params.id;
    let prefix = config.bonPrefix;
    if (id.match(/.+-\d+/)) {
        [prefix, id] = id.split("-");
    }
    let markAsRead = true;
    mailManager.getBonMails(prefix, id, markAsRead, (status, mails) => {
        if (status) {
            res.json(mails);
        } else {
            console.log("get BonMails", mails);
            res.sendStatus(500);

        }
    })
})

function mailConfirmations(confirmMessage, orders, callback) {
    if (orders.length === 0) {
        callback(true);
        return;
    }

    let dateFormat = config.mailManager.incomingMails.dateFormat;
    let subjectMessage = config.mailManager.incomingMails.confirmSubject;

    let order = orders[0];
    let rest = orders.slice(1);

    let bon = DB.searchBons({ bonId: order.bonId }, true, null)[0]


    let subject = "#Bon:" + config.bonPrefix + "-" + order.bonId + ":" + (subjectMessage ? subjectMessage : "");
    let message = BonUtils.expandMessageFromBon(confirmMessage, bon, dateFormat);

    if (bon.customer.email) {
        mailSender.sendMail(config.mail.user, bon.customer.email, undefined, undefined, subject, message, undefined, function (err) {
            if (err !== null) {
                console.log("mailConfirmations", err);
                callback(false, err)
            } else {
                mailConfirmations(rest, callback);
            }
        });
    } else {
        mailConfirmations(rest, callback);
    }




}


function mailIncomingOrders(orders, callback) {
    if (orders.length === 0) {
        callback(true);
        return;
    }
    let order = orders[0];
    let rest = orders.slice(1);
    let subject = "#Bon:" + config.bonPrefix + "-" + order.bonId + ":";
    let message = order.orgMessage;

    mailSender.sendMail(config.mail.user, config.mail.user, undefined, undefined, "INCOMING:" + subject, message, undefined, function (err) {
        if (err !== null) {
            console.log("mailIncomingOrders", err);
            callback(false, err)
        } else {
            mailIncomingOrders(rest, callback)
        }
    });
}


app.get("/api/unseenBonIdMails", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    mailManager.getUnseenMails(config.bonPrefix, (status, mails) => {
        if (status) {
            res.json(mailManager.getBonIds(mails));
        } else {
            console.log("getUnseenMails", mails);
            res.sendStatus(500);

        }
    });
})


app.get("/api/allBonWithMails", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    let mailsSince = undefined;
    if (req.query.mailsSince !== "") {
        mailsSince = new Date(req.query.mailsSince);
    }
    mailManager.getBonWithMails("*", mailsSince, (status, mails) => {
        mails.forEach(m => {
            let searchParams = { bonId: m.bonId };
            let [bon] = allBonInstances.searchBons(m.prefix, searchParams, true, null);
            m.bon = bon;
        })
        res.json(mails.filter((m) => (m.bon !== undefined)));
    });
})






app.get("/api/allUnseenBonIdMails", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    mailManager.getUnseenMails("*", (status, mails) => {
        if (status) {
            res.json(mailManager.getBonIds(mails, true));
        } else {
            console.log("getUnseenMails", mails);
            res.sendStatus(500);

        }
    });
})


app.get("/api/getBonsForWeek", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }
    let monday = new Date(req.query.monday);
    try {
        let bons = allBonInstances.getBonsForWeek(monday, null);
        res.json(bons);
    } catch (err) {
        console.log("getBonsForWeek", err);
        res.sendStatus(500);
    }

})

app.post("/api/moveBon", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }
    let id = req.body.bonId;
    let prefix = req.body.prefix;
    let force = req.body.force;
    allBonInstances.moveBon(id, prefix, force, (status, result) => {
        if (status) {
            res.json(result);
        } else {
            res.sendStatus(500);
        }
    });
}
)
/*setTimeout(()=>{
    allBonInstances.moveBon("test-294","trailer",true);
},2500);*/


app.get("/api/checkStock", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }

    //Don't do this now
    res.json([]);
    return;

    allBonInstances.checkStock((status, bons) => {
        if (status) {
            res.json(bons);
        } else {
            console.log("checkStock", bons);
            res.sendStatus(500);

        }

    })


})


app.get("/api/messages", (req, res) => {

    DB.getMessages(function (status, messages) {
        if (status) {
            res.json(messages);
        } else {
            console.log("getMessages", messages);
            res.sendStatus(404);

        }
    })
})



app.post("/api/messages", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }

    let message = req.body;

    DB.createMessage(message, function (status, message) {
        if (status) {
            res.json(message);
        } else {
            console.log("createMessage", message);
            if (message == "SQLITE_CONSTRAINT_UNIQUE") {
                res.sendStatus(409);
            } else {
                res.sendStatus(500);
            }
        }
    })
})


app.put("/api/messages/:id", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }


    let message = req.body;
    let id = req.params.id;

    DB.updateMessages(id, message, function (status, err) {
        if (status) {
            res.sendStatus(200);

        } else {
            console.log("updateMessage", err);
            res.sendStatus(500);

        }
    })
})

app.delete("/api/messages/:id", (req, res) => {
    if (!loginHandler.checkRoles(req, "${ADMIN}")) {
        res.sendStatus(401);
        return;
    }
    let id = req.params.id;
    DB.deleteMessage(id, function (status, err) {
        if (status) {
            res.sendStatus(200);

        } else {
            console.log("deleteMessage", err);
            res.sendStatus(500);

        }
    })

})


app.put("/api/notifyBon/:id", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let bonId = req.params.id;
    let message = req.body.message
    let userId = loginHandler.getSession(req).userId;
    DB.notifyBon(userId, bonId, message, (status) => {
        if (status) {
            res.sendStatus(200);

        } else {
            console.log("notifyBon: something went wrong");
            res.sendStatus(500);
        }
    })
})

app.put("/api/seeBon/:id", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let bonId = req.params.id;
    let userId = loginHandler.getSession(req).userId;
    DB.seeBon(userId, bonId, (status) => {
        if (status) {
            res.sendStatus(200);

        } else {
            console.log("seeBon: something went wrong");
            res.sendStatus(500);
        }
    })
})

app.get("/api/getNotifiedBon", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let userId = loginHandler.getSession(req).userId;
    DB.getNotifiedBon(userId, (status, bonId) => {
        if (status) {
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
        let bonId = req.body.bonId;
        let orders = req.body.orders;
        allBonInstances.getGrocyProductsForOrders(bonId, orders, (status, orders) => {
            if (status) {
                res.json(orders);
            } else {
                console.log("getGrocyProductsForOrders, something went wrong", orders);
                res.sendStatus(500);
            }
        });
    }
});

app.post("/api/createInvoiceDraft", (req, res) => { });


app.get("/api/getShoppingLists", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    grocyFuncs.getShoppingLists(function (status, shoppingLists) {
        if (status) {
            shoppingLists.sort((a, b) => (b.id - a.id))
            res.json(shoppingLists);
        } else {
            console.log("getMessages", shoppingLists);
            res.sendStatus(404);

        }
    })
})

app.post("/api/addToShoppingList", (req, res) => {
    if (!loginHandler.isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    let products = req.body.products;
    let shoppingListId = req.body.shoppingListId;
    let resetShoppingList = req.body.resetShoppingList;

    let func = () => {
        grocyFuncs.addProductsToShoppingList(products, shoppingListId, (status, message) => {
            if (status) {
                res.sendStatus(200);
            } else {
                console.log("addToShoppingList", message);
                res.sendStatus(500);
            }
        })
    }

    if (resetShoppingList) {
        grocyFuncs.clearShoppingList(shoppingListId, (status) => {
            if (!status) {
                console.log("Failed to clear shoppinglist with id " + shoppingListId);
            }
            func();
        })
    } else {
        func();
    }

})


app.get("/api/geo/route", (req, res) => {
    let a = [req.query.A_lat, req.query.A_lon];
    let z = [req.query.Z_lat, req.query.Z_lon];
    addressFunctions.getRoute(a, z, (data) => {
        res.json(data);
    })
})

app.post("/api/geo/timeAndDistanceMatrix", (req, res) => {
    let places = req.body;
    addressFunctions.getTimeAndDistanceMatrix(places, (data) => {
        res.json(data);
    })
})

app.post("/api/geo/geoInfo", (req, res) => {
    let bonIds = req.body;
    res.json(DB.getGeoInfo(bonIds));
})

const JotFormParser = require("./JotFormParser.js");

const multer = require('multer');
const upload = multer();
app.post("/webhook", upload.none(), async (req, res) => {
    let submissionId = req.body.submissionID;
    let bonApiKey = req.query.bonApiKey;

    if (!config.jotForm) {
        console.log("JotForm config not set");
        res.sendStatus(404);
        return;
    }

    if (config.jotForm?.apiKey && config.jotForm.apiKey !== bonApiKey) {
        console.log("Invalid webhook apiKey");
        res.sendStatus(401);
        return;
    }

    let bonId = "???";
    try {
        let rawRequest = JSON.parse(req.body.rawRequest);
        let bon = JotFormParser.getBon(rawRequest, DB);
        bonId = await DB.createBon(bon, null);
        bon.id = bonId;
        if (config.jotForm?.sendConfirmationMail) {
            JotFormParser.sendConfirmationMail(bon, config, mailSender, DB);
        }
        res.sendStatus(200);
    } catch (err) {
        console.log("Error in webhook", err);
        if (config.jotForm?.mailOnError) {
            JotFormParser.sendOnErrorMail(bonId, submissionId, err, config, mailSender);
        }
        res.sendStatus(500);
    }

})