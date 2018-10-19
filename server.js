var path = require('path');
var express = require('express');
var api = require('./api');
var bodyParser = require('body-parser');
var cors = require('cors');
var admin = require('firebase-admin');

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kudos-f16.firebaseio.com'
});

var db = admin.database();

var desks = db.ref("desks");

desks.on("value", function(snapshot) {
    console.log(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

var app = express();

app.use(cors());
app.options('*', cors());
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
