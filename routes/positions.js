var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
    var options = {
        root: 'data/json/'
    };
    var fileName = 'pos-pretty.json';
    res.setHeader('Content-Type','application/json');
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
        console.log('Sent:', fileName);
        }
    });
    
}).get('/',function(req,res,next){
            res.send("Positions");
});
module.exports = router;
