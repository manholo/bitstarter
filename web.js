var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

var getDataFromFile = function(file, cont ) {
    cont(fs.readFileSync(file));
}

app.get('/', function(request, response) {
    getDataFromFile("index.html", response.send);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});