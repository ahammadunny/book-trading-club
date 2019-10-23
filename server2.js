

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
//const cookieParser = require('cookie-parser');
//const dbURL = process.env.dbURL || 'mongodb://localhost/polls';
//const methodOverride = require('method-override');
const flash = require('express-flash');
//const SECRET = process.env.SECRET || 'my secret combination'
const LocalStrategy = require('passport-local').Strategy;
//const passportLocalMongoose = require('passport-local-mongoose');
const circularjson=require('circular-json');
const User = require('./models/user');
const Book = require('./models/book');
const Email= require('./models/email')
const path = require('path');
var session = require('express-session');
var bodyparser = require('body-parser');
 var requestHTTP = require('request');
var books = require('google-books-search');
const app = express();
app.use(logger('dev'));
require('dotenv').config();
//app.use(bodyparser.json());

app.use(bodyparser.urlencoded({extended: true}));

//app.use(cookieParser());
require('./config/db.js');
const user = require('./config/user2.js');
//var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;
//var uri = 'process.env.MONGOLAB_URI';
//Passport Auth Stuff
var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;
//var uri = 'process.env.MONGOLAB_URI';
//Passport Auth Stuff

//require ('./config/passport.js');
//app.use(user);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

app.use(express.static(path.join(__dirname, 'public')));



// Configure passport middleware

//app.use(passport.initialize());

//app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//passport.use(User.createStrategy());
// passport.use(new LocalStrategy(function(username, password, done) { User.authenticate(username, password, function(err, user, info){ return done(err, user, info); }); } )); 




//passport.serializeUser(User.serializeUser());


//passport.deserializeUser(User.deserializeUser());
//require('./config/passport.js');
app.use(flash());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(user);
//app.use(require('/app/config/trade.js'));
app.use(require ('/app/config/app.js'))
var query = {
    player: 'player'
};

app.use(require('/app/config/trade.js'));


app.get("/", function (request, response) {
  
/*
var counter=0;
User.find({}).exec(function(err,users) {
  users.forEach (function(user) {
  counter++;
  if(!user.firstname) {user.firstname='ahammadunny'+counter;
  user.lastname = "Path "+counter;
  user.save();
   console.log("firstname is " +user.firstname )                
                  }
  
  }
  
  )
  });
  
  */
  
  Book.find({}).exec(function(err,books) {
  books.forEach (function(book) {
  
  book.status = 'available';
  book.save();
   console.log("status is " +book.status )                
                  });
  
  
  
  
  });
  
  
 
  /*
var counter = 0;
var counter2 =0;
  User.find({}).exec(function(err,users) {
  users.forEach (function(user) {
  if(user.email || user.addedBooks || user.firstname || user.twitter || user.username) {
    counter++;
  email = user;
  email.save();
   console.log("the email is " +user.email +user.firstname  +user.username +counter ) 

                  } else { 
                    counter2++; console.log("the name is" +user.name +counter2);
                    user.remove();
                    user.save();
                         
                         }
  
  }
  
  )
  });
  

  */
  
  
  
  
  
  
  if(request) { console.log("request is true")} 
  else { console.log("request is false")};
  console.log("request is  "+circularjson.stringify(request));
  response.locals.user = request.user;
  var requestuser = JSON.stringify(request.user);
  console.log("REQUESTUSER is "+requestuser);
  //response.sendFile(__dirname + '/views/index.html');
 if (request.user) {
   response.locals.id = request.user._id;
    // The user cannot trade with their self so don't include their books
   console.log("user._id is " + request.user._id);
   // Book.find({$or:[{_user: {$ne:request.user._id }}, {owner : {$ne:request.user._id}}]})
   Book.find({ _user: { $ne: request.user._id }}).find({owner: {$ne: request.user._id}})
      .exec((err, books) => {
        if (err) throw err;

     console.log("books not  owned by the user are "+JSON.stringify(books))
        response.render('index.ejs', { books:books });
      //response.json(books);
      });
  } else {
    Book.find({}).exec(  (err, books) => {
      if (err) throw err;
console.log("all books are "+JSON.stringify(books))
     response.render('index.ejs', { books:books });
     // response.json(books);
    });
  }
  
});




var listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});