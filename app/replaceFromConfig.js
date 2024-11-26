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

var files = process.argv.slice(2);

if(files.length===0) {
    console.log(`usage node ${process.argv[1]} file...`);
}

files.forEach(file => {
  replaceInFile(file);
});

