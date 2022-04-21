var config = require("../resources/config.js");

var fs = require("fs");

function replaceInFile(file) {
  fs.readFile(file, "utf8", function (err, data) {
    if (err) {
      return console.log(err);
    }
    var result = eval('`'+data+'`');

    fs.writeFile(file, result, "utf8", function (err) {
      if (err) return console.log(err);
    });
  });
}

var args = process.argv.slice(2);

let file=args[0];
if(!file) {
    console.log(`usage node ${process.argv[1]} file`);
}

replaceInFile(file);
