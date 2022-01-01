var express = require('express');
var http = require('http');
var https = require('https');

var app = express();

var config=require('../resources/config.js');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(config.app.http,() => console.log('App listening at http://localhost:'+config.app.http));
httpsServer.listen(config.app.https,() => console.log('App listening at https://localhost:'+config.app.https));

