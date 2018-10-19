var router = require('express').Router();
var mocks = require('./mock');
var assign = require('object-assign');
var admin = require('firebase-admin');

var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kudos-f16.firebaseio.com'
});

var db = admin.database();

var desks = db.ref("desks");

var data = null;

desks.on("value", function(snapshot) {
    data = snapshot.val();
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});


router.get('/desk', function (req, res, next) {
    var desks = data.map(function (desk) {
            return assign({}, desk, {
                text: undefined
            })
        }),
        limit = Number(req.query.limit) || desks.length,
        offset = Number(req.query.offset) || 0;
     res.json(desks.slice(offset, limit + offset))
});

router.get('/desk/:id', function (req, res, next) {
     
    var desk = mocks.desks.filter(function (desk) {
        return desk.id == req.params.id
    })[0];
    if (desk) return res.json(desk);
     res.status(404).json({error: "not found"});
});

router.post('/desk', function (req, res, next) {
    var body = req.body;
    var desk = {
        text: body.text,
        id: Date.now().toString(),
        user: body.user,
        date: new Date()
    };
    mocks.desks.push(desk);
    res.json(desk)
});

router.get('/kudos', function (req, res, next) {
    var aid = req.query.desk;
    if (aid) {
        var desk = mocks.desks.find(function(desk) {
            return desk.id == aid
        })
        return res.json((desk.kudoses || []).map(function(id) {
            return mocks.kudoses.find(function(kudos) {
                return kudos.id == id
            })
        }))
    }
     var limit = Number(req.query.limit) || mocks.kudoses.length,
        offset = Number(req.query.offset) || 0;
    res.json({
        total: mocks.kudoses.length,
        records: mocks.kudoses.slice(offset, limit + offset)
    })
});

router.post('/kudos', function (req, res, next) {
    var kudos = {
        id : Date.now().toString(),
        text : req.body.text,
        date: new Date(),
        user: req.body.user,
        desk : req.body.desk
    };
    mocks.kudoses.push(kudos);
    res.json(kudos)
});

router.post('/report', function (req, res) {
    res.json({})
})
 module.exports = router;