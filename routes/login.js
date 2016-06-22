var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
var fold = 'auth';
router.use('/stylesheets', express.static(path.join(__dirname,'stylesheets',fold)));
router.use('/js', express.static(path.join(__dirname,'js',fold)));
router.get('/', function(req, res, next) {
    var options = {
        root: 'public/html'
    };
    var fileName = 'index.html';
    
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
        console.log('Sent:', fileName);
        }
    });
});

module.exports = router;
