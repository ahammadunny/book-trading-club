

// server.js
// where your node app starts

// init project
var express = require('express');
const router = express.Router();
var mongodb = require('mongodb');
var ejs = require('ejs');
var circularJSON = require('circular-json');
var logger = require('morgan');
var passport = require('passport');
//var Strategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
//const dbURL = process.env.dbURL || 'mongodb://localhost/polls';
//const methodOverride = require('method-override');
const flash = require('express-flash');
//const SECRET = process.env.SECRET || 'my secret combination'
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('../models/user');
var session = require('express-session');
var bodyparser = require('body-parser');
 var requestHTTP = require('request');
var books = require('google-books-search');
var app = express();


app.get('/signup', (req, res) => {
	res.render('register');
});

 app.post('/signup', (req, res) => {
	var newUser = new User({username: req.body.username});
	// register method hashes the password
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('register');
		}
		// if no error occurs, local strategy authentication takes place
		passport.authenticate('local')(req, res, () => {
			res.redirect('/');
		});
	});
})


// login form
app.get('/login', (req, res) => {
	res.render('login', {message: req.flash('error')});
 // res.render('login');
});


// user login

app.post('/login', function(req, res, next) {
  //console.log("here is the req"+circularJSON.stringify(req));
 // console.log("here is the res"+circularJSON.stringify(res));
  passport.authenticate('local', function(err, user, info) { 
    if(info) {
   var infotxt= JSON.stringify(info);
    console.log("this is the info" +infotxt);
     // res.render('login', {message: info.message});
 return   res.render('login',  {message :{message1: info.name, message2:info.message}});
    }
    else {console.log("there is no info"+"here is the user object"+JSON.stringify(user))}
   // if(err) throw err;
    if (err) { //console.log("there is an error"+user);
        console.log("this is the info inside err"+infotxt);
      return next(err); }
    if (!user) { console.log("no username given"+circularJSON.stringify(req));
      return res.render('login'), {message :{message1: info.name, message2:info.message}}};
    req.logIn(user, function(err) {
     if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});




// Logout
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


/*
// listen for requests :)
var listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

*/
