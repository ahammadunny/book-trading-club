

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
//const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./models/user');
var session = require('express-session');
var bodyparser = require('body-parser');
 var requestHTTP = require('request');
var books = require('google-books-search');
var app = express();
app.use(logger('dev'));

app.use(bodyparser.json());

app.use(bodyparser.urlencoded({extended: false}));

app.use(cookieParser());
//require('./config/db.js');
//var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;
//var uri = 'process.env.MONGOLAB_URI';
//Passport Auth Stuff
var uri = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.PORT+'/'+process.env.DB;
//var uri = 'process.env.MONGOLAB_URI';
//Passport Auth Stuff
mongoose.connect(uri);
//require ('./config/passport.js');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

//app.use(express.static(path.join(__dirname, 'public')));



// Configure passport middleware

app.use(passport.initialize());


app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// passport.use(new LocalStrategy(function(username, password, done) { User.authenticate(username, password, function(err, user, info){ return done(err, user, info); }); } )); 




passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());
//require('./config/passport.js');
app.use(flash());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
//app.use(bodyparser.urlencoded({extended: true}));

/*
app.engine('ejs', handlebars({
  extname: 'ejs',
  defaultLayout: 'default', 
  layoutsDir: 'views'+ '/layouts',
  partialsDir: 'views' + '/partials'
}));
app.set('view engine', 'ejs');

*/
/*
if (app.get('env') === 'development') {

  app.use(function(err, req, res, next) {

    res.status(err.status || 500);

    res.render('error', {

      message: err.message,

      error: err

    });

  });

}

*/



//if (app.get('env') === 'development') {
/*
  app.use(function(err, req, res, next) {

    res.status(err.status || 500);

    res.render('error', {

      message: err.message,

      error: err,

    });

  });
  */

//}



// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.locals.user = request.user;
  var requestuser = JSON.stringify(request.user);
  console.log("REQUESTUSER is "+requestuser);
  //response.sendFile(__dirname + '/views/index.html');
 /*
  if(request.isAuthenticated()){
     mongodb.MongoClient.connect(uri, (err, dbase)=>{
      if(err) throw err;
      var dbx = dbase.db(process.env.DB) ;
      var coll = dbx.collection(process.env.COLLECTION1);
      var data = {"uid":  request.user._id , "name": request.user.displayName, "city": null, "state": null};
      coll.findAndModify({ uid:  request.user._id  },{},{$setOnInsert: data},{new: true,upsert: true},(err, dbase)=>{
        if(err) throw err;  
      });
    });
  }
  */
  mongodb.MongoClient.connect(uri, (err, dbase)=>{
      if(err) throw err;
      var dbx = dbase.db(process.env.DB);
      var coll = dbx.collection(process.env.COLLECTION);
      coll.find().toArray((err, doc)=>{
        if (err) throw err;
          if(request.isAuthenticated()){
            response.render('index', { auth: request.isAuthenticated(), db: doc, uid:request.user._id});
          }else{
            response.render('index', { auth: request.isAuthenticated(), db: doc});
          }
      var docstring = JSON.stringify(doc);
       // console.log("documents are "+docstring);
        
          
      });
    });
});

app.get("/request/book/:ISBN/:ID", function (request, response) {
if(request.isAuthenticated()){
    mongodb.MongoClient.connect(uri, (err, dbase)=>{
      if(err) throw err;
      var dbx = dbase.db(process.env.DB);
      var coll = dbx.collection(process.env.COLLECTION);
      var qr = {"isbn": request.params.ISBN,"uid": request.params.ID};
      coll.find(qr).toArray((err, doc)=>{
        if (err) throw err;
        var up_data = null;
        console.log(doc);
        if(doc[0].user_request == 0){
          up_data = {"user_request": request.user._id+','};
        }else{
           up_data = {"user_request": doc[0].user_request+request.user._id+','};
        }
        coll.updateOne(qr,{ $set:up_data},(err, doc1)=>{
        if (err) throw err;
        response.redirect('/');    
        });
      });
    });
  }else{
    response.send({"Error": "Not Authenticated."});
  }
})

app.get("/profile/show/:ID", function (request, response) {
  if(request.isAuthenticated()){
    mongodb.MongoClient.connect(uri, (err, dbase)=>{
      if(err) throw err;
      var dbx = dbase.db(process.env.DB);
      var coll = dbx.collection(process.env.COLLECTION1);
      coll.find({"uid": request.params.ID}).toArray((err, doc)=>{
        if (err) throw err;
          response.render('show', { auth: request.isAuthenticated(), profile: doc});
      });
    });
  }else{
    response.send({"Error": "Not Authenticated."});
  }
});

app.get("/remove/book/:ISBN", function (request, response) {
  mongodb.MongoClient.connect(uri, (err, dbase)=>{
      if(err) throw err;
      var dbx = dbase.db(process.env.DB);
      var coll = dbx.collection(process.env.COLLECTION);
      coll.remove({"uid":request.user.id, "isbn":request.params.ISBN},(err, doc)=>{
        if (err) throw err;
        response.redirect('/dashboard');
      });
    });
});

app.get("/accept/book/:ISBN/:ID", function (request, response) {
  mongodb.MongoClient.connect(uri, (err, dbase)=>{
    if(err) throw err;
    var dbx = dbase.db(process.env.DB);
    var coll = dbx.collection(process.env.COLLECTION);
    coll.updateOne({"uid":request.params.ID,"isbn":request.params.ISBN},{ $set:{"accept":request.params.ID}},(err, doc1)=>{
      if (err) throw err;
      response.redirect('/dashboard');    
    });
  });
});

app.get("/profile/edit", function (request, response) {
  if(request.isAuthenticated()){
    mongodb.MongoClient.connect(uri, (err, dbase)=>{
      if(err) throw err;
      var dbx = dbase.db(process.env.DB);
      var coll = dbx.collection(process.env.COLLECTION1);
      coll.find({"uid": request.user.id}).toArray((err, doc)=>{
        if (err) throw err;
          console.log(doc);
          response.render('edit', { auth: request.isAuthenticated(), profile: doc});
      });
    });
  }else{
    response.send({"Error": "Not Authenticated."});
  }
});

app.get("/dashboard", function (request, response) {
  if(request.isAuthenticated()){
    mongodb.MongoClient.connect(uri, (err, dbase)=>{
      if(err) throw err;
      var dbx = dbase.db(process.env.DB);
      var coll = dbx.collection(process.env.COLLECTION);
      coll.find({"uid": request.user._id}).toArray((err, doc1)=>{
        if (err) throw err;
        coll.find().toArray((err, doc2)=>{
        if (err) throw err;    
  response.render('dashboard', { auth: request.isAuthenticated(), userBooks: doc1, userBooks2: doc2, userBooks3: doc1, user: request.user.id});
        });
      });
    });
  }else{
    response.send({"Error": "Not Authenticated."});
  }
});

app.post("/profile/edit", function (request, response) {
  mongodb.MongoClient.connect(uri, (err, dbase)=>{
    if(err) throw err;
    var dbx = dbase.db(process.env.DB);
    var coll = dbx.collection(process.env.COLLECTION1);
    coll.findOneAndUpdate({uid: request.user._id}, {$set:{"name":request.body.nameInput, "city": request.body.cityInput, "state": request.body.stateInput}}, {upsert: true,new: true},(err, doc1)=>{
      if (err) throw err;
      response.redirect('/profile/edit');    
    });
  });
});

app.post("/old", function (request, response){ 
  var url = 'https://openlibrary.org/api/books?bibkeys=ISBN:'+request.body.addBook+'&jscmd=details&format=json';
  requestHTTP(url, function (error, res, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    if(!error){
    if(body != '{}'){
      var JSON_data = JSON.parse(body);
      console.log("JSON_data is "+JSON.stringify(JSON_data));
      var title = JSON_data["ISBN:"+request.body.addBook]["details"].title;
      console.log(title);
      var thumb;
      if(JSON_data["ISBN:"+request.body.addBook].thumbnail_url != undefined){
        thumb = JSON_data["ISBN:"+request.body.addBook].thumbnail_url.replace('S', 'M');
      }else{
        thumb = 'https://cdn.glitch.com/c903ae76-9abc-461e-9def-f60981cc9412%2Fno-cover.png?1519750744904';
      }
      console.log(thumb);
      var book_data = {"isbn": request.body.addBook, "title": title, "thumb": thumb, "uid": request.user._id, "accept": 0, user_request: 0} 
      mongodb.MongoClient.connect(uri, (err, dbase)=>{
        if(err) throw err;
        var dbx = dbase.db(process.env.DB);
        var coll = dbx.collection(process.env.COLLECTION);
        coll.insert(book_data,(err,res)=>{
          if(err) throw err;
          res.redirect('/');
        });
      });
    }else{
      response.send({"Error": "Unable to find book."});
    }
    }
  });
});


app.post('/new', (req, response) => {
  const  q  = req.body.addBook;
  console.log("q is "+JSON.stringify(q));
  
  if (!q) return response.redirect('/new');
  
  books.search(q, function(err, results) {
    if (err) {
      console.log(err);
      response.redirect('/new');
    } else {
      console.log("the results are " +JSON.stringify(results));
      console.log("the length of the results is "+results.length);
      var book_data = {"isbn":results[0].industryIdentifiers[0].identifier, "title": results[0].title, "uid": req.user._id,
      "thumb": results[0].thumbnail, "accept":0, "user_request":0}
      mongodb.MongoClient.connect(uri, (err, dbase)=>{
        if(err) throw err;
        var dbx = dbase.db(process.env.DB);
        var coll = dbx.collection(process.env.COLLECTION);
        coll.insert(book_data,(err,res)=>{
          if(err) throw err;
          response.redirect('/');
        });
      });
      
    }
  });
});







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
  console.log("here is the req"+circularJSON.stringify(req));
  console.log("Here is the isAuthenticated"+circularJSON.stringify(req.isAuthenticated()))
  console.log("here is the res"+circularJSON.stringify(res));
  passport.authenticate('local', function(err, user, info) { 
    console.log("Here is the isAuthenticated after the attempt "+circularJSON.stringify(req.isAuthenticated()))
    if(info) {
   var infotxt= JSON.stringify(info);
    console.log("this is the info" +infotxt);
     // res.render('login', {message: info.message});
 return   res.render('login',  {message :{message1: info.name, message2:info.message}});
    }
    else {console.log("there is no info"+"here is the user object"+JSON.stringify(user));
          console.log("Here is the isAuthenticated third time "+circularJSON.stringify(req.isAuthenticated()))
         }
         
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


/*
app.post('/login', passport.authenticate('local',  {
	successRedirect: '/',
  failureRedirect: '/login'
}), (re
q, res) => {
  
  req.locals.user= req._user;
  if (req._user) { res.json(req._user); }
 console.log("the user is"+req._user);
});

*/

// Logout
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});





// listen for requests :)
var listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

/*
router.get('/signup', (req, res) => {
	res.render('register.html');
});

 router.post('/signup', (req, res) => {
	var newUser = new User({username: req.body.username});
	// register method hashes the password
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('register.html');
		}
		// if no error occurs, local strategy authentication takes place
		passport.authenticate('local')(req, res, () => {
			res.redirect('/'); 
		});
	});
})

// login form
router.get('/login', (req, res) => {
	res.render('login.html');
});

// user login
router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login'
}), (req, res) => {
});

// user logout
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});



// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

*/