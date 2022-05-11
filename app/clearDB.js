var sqlite3 = require("better-sqlite3");

var path = require("path");

var db = new sqlite3("./resources/bon.db");
db.pragma("foreign_keys = ON");

db.prepare("delete from bons;").run();
db.prepare("delete from addresses;").run();
db.prepare("delete from companies;").run();
db.prepare("delete from customers;").run();
db.prepare("delete from salesprice_categories;").run();

