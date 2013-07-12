var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

var getDataFromFile = function(file, cont ) {
    cont.send(fs.readFileSync(file).toString());
}

app.get('/', function(request, response) {
    getDataFromFile("index.html", response );
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});