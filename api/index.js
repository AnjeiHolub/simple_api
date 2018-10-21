var router = require('express').Router();
var mocks = require('./mock');
var assign = require('object-assign');
var admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kudos-f16.firebaseio.com'
});

var database = admin.database();

var boardsRef = database.ref("boards");
var kudosesRef = database.ref("kudoses");

var boardsData = null;
var kudosesData = null;

boardsRef.on("value", function(snapshot) {
    boardsData = snapshot.val();
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

kudosesRef.on("value", function(snapshot) {
    kudosesData = snapshot.val();
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});


router.get('/board', function (req, res, next) {
    var boards = boardsData.map(function (board) {
            return assign({}, board, {
                text: undefined
            })
        }),
        limit = Number(req.query.limit) || boards.length,
        offset = Number(req.query.offset) || 0;
     res.json(boards.slice(offset, limit + offset))
});

router.get('/board/:id', function (req, res, next) {
     
    var board = boardsData.filter(function (board) {
        return board.id == req.params.id
    })[0];
    if (board) return res.json(board);
     res.status(404).json({error: "not found"});
});

router.post('/board', function (req, res, next) {
    var body = req.body;
    var board = {
        text: body.text,
        id: Date.now().toString(),
        user: body.user,
        date: new Date()
    };
    boardsData.push(board);
    res.json(board)
});

router.get('/kudos', function (req, res, next) {
    var aid = req.query.board;
    if (aid) {
        var board = boardsData.find(function(board) {
            return board.id == aid
        })
        return res.json((board.kudoses || []).map(function(id) {
            return kudosesData.find(function(kudos) {
                return kudos.id == id
            })
        }))
    }
     var limit = Number(req.query.limit) || kudosesData.length,
        offset = Number(req.query.offset) || 0;
    res.json({
        total: kudosesData.length,
        records: kudosesData.slice(offset, limit + offset)
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
    kudosesData.push(kudos);
    res.json(kudos)
});

router.post('/report', function (req, res) {
    res.json({})
})
 module.exports = router;