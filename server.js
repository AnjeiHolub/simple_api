var path = require('path');
var express = require('express');
var api = require('./api');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use('/api', api);

var server = app.listen(process.env.PORT || 8080, function (err) {
    if (err) {
        console.log(err);
        return;
    }

    var port = server.address().port;
    console.log("App now running on port", port);
});
