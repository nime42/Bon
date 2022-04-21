var config=require('../resources/config.js');
const fetch = require('node-fetch');

let url=`http://localhost:${config.app.http}/shutdown`;
fetch(url);

