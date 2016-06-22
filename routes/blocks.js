var express = require('express');
var router = express.Router();
var path = require('path');

var fold = 'auth';
router.use('/stylesheets', express.static(path.join(__dirname,'stylesheets',fold)));
router.use('/js', express.static(path.join(__dirname,'js',fold)));

/* GET home page. */
router.post('/', function(req, res, next) {
    var options = {
        root: 'data/json/'
        
    };
    res.setHeader('Content-Type','application/json');
    var fileName = 'blocks-pretty.json';
    
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
        console.log('Sent:', fileName);
        }
    });
    
}).get('/',function(req,res,next){
            res.send("Blocks");
});
module.exports = router;
