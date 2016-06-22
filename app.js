var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var schedule = require('./routes/index');
var users = require('./routes/users');
var locations = require('./routes/locations');
var positions = require('./routes/positions');
var blocks = require('./routes/blocks');
var session = require('express-session');
var login = require('./routes/login');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/wiw';
var shifts;
var user;
var users = [];
var mdb;

var findUsers = function(db,callback){
	var cursor =db.collection('users').find();
	users = [];
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc !== null) {

		  users.push(doc);
		  callback();
		} else {
			
		}
	});
	
};
var getShifts = function(db,callback,cb2){
	var cursor =db.collection('new_shifts').find();
	
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc !== null) {
		  callback(doc);
		} else {
			cb2();
		}
	});
};
var findUser = function(id,callback) {

	var cursor =mdb.collection('users').find({'id':parseInt(id)});
	
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc !== null) {
			callback(doc);
		} else {
			
		}
	});
	/*
  for(var i in users){
		if(users[i].id === parseInt(id)){
			user = users[i];
			callback(user);
		}
	}
	*/
};
var insertUser = function(db,user,callback){
	db.collection('users').insertOne(user,
	function(err,result){
		assert.equal(err,null);
		console.log("Inserted settings for "+user.first_name+"!");
		callback(result);
	});
};

var updateUser = function(db,user,info,callback){
	
	db.collection('users').replaceOne({'id':parseInt(user)},info,
	function(err,result){
		assert.equal(err,null);
		console.log("Updated user");
		
		callback(result);
	});
};
MongoClient.connect(url, function(err, db) {
		

	assert.equal(null, err);
	console.log("Connected correctly to server.");
	mdb = db;
	//findUsers(db,function(){
		
	//});
	//getShifts(db,function(){
		
	//});
});
var app = express();

app.set('trust proxy', 1);

var authCheck = function(req,res,next){
   var token = req.session.tok;
   var uid = req.session.uid;
   
   if(!token){
       req.session.error = 'Access denied!';
       res.redirect('/');
   } else {
       // Check token and user id against DB before continuing.
       console.log("Auth Check Successful");
       next();
   }
};
app.use(session(
{
    resave: false,
    secret: 'hobbit',
    proxy: true,
    saveUninitialized: false
}));

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

// uncomment after placing your favicon in /public
app.use('/node_modules',express.static(path.join(__dirname,'node_modules')));
app.use('/bower_components',express.static(path.join(__dirname,'bower_components')));

app.use(favicon(path.join(__dirname, 'public/images/icon', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',login);
app.use('/#/',authCheck);
app.use('/loc', authCheck, locations);
app.use('/pos', authCheck, positions);
app.use('/blocks', authCheck, blocks);
app.use('/schedule',authCheck, schedule);

// GETS
app.get('/shifts',function(req,res,next){
	
	delete shifts;
	shifts = [];
	getShifts(mdb,function(shift){
		shifts.push(shift);
	},function(){
		
		res.send({'shifts':shifts}).end();
	});

	res.status('200');
	
});
app.get('/users',function(req,res,next){
	
	findUser(req.cookies.uid,function(user){
		res.status(200);
		res.send(user).end();
			
	});

});
////////////////////
// POSTS
app.post('/login', function(req,res,next) {
    var uid = req.body.uid;
    var tok = req.body.tok;
    
    req.session.regenerate(function(){
        req.session.uid = uid;
        req.session.tok = tok;
        res.status(200);
        res.end();
    });

});
app.post('/shifts',function(req,res,next){
	
	mdb.collection('new_shifts').replaceOne({'date':req.body.shift.date,'user_id':req.body.shift.user_id},req.body.shift,
		function(err,result){
			assert.equal(err,null);
			console.log("Updated new shift");
			if(result.result.nModified){
				res.end();
			} else {
				mdb.collection('new_shifts').insertOne(req.body.shift,
					function(err,result){
						assert.equal(err,null);
						console.log("Inserted new shift");
						res.end();
					});
			}
			delete shifts;
			shifts = [];
			getShifts(mdb,function(shift){
				shifts.push(shift);
			},function(){

			});

	});
	
});
app.post('/users',function(req,res,next){
	
	updateUser(mdb,req.cookies.uid,req.body.user,function(result){
		console.log(result.result);
		res.status('200');
		res.end();
	});
});

//DELETEs
app.delete('/shifts/:user_id/:date',function(req,res,next){
	mdb.collection('new_shifts').deleteMany({
		'user_id': parseInt(req.params.user_id),
		'date': req.params.date
	},function(err,results){
		assert.equal(err,null);
		
		console.log("Deleted new shift.");
		shifts.forEach(function(shift,index,shts){
			if(shift.user_id === parseInt(req.params.user_id) && shift.date === req.params.date){
				delete shift;
				shifts.splice(index,1);
			}
		});
		res.end();
	});
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('error');
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send("Error");
});

module.exports = app;
