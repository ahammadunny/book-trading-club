
const express=require('express');
//const router=express.Router();
const app = express();
const passport=require('passport');
const User=require('../models/user');
var circularJSON = require('circular-json');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(passport.initialize());

app.use(passport.session());
passport.serializeUser(User.serializeUser());


passport.deserializeUser(User.deserializeUser());

app.get('/signup',function(req,res){
  res.locals.user - req.user;
    res.render('register',{signupError:req.flash('signupError')});
});

app.post('/signup', (req, res) => {
	var newUser = new User({username: req.body.username,email: req.body.email});
  console.log("newUser is"+JSON.stringify(newUser));
  console.log("username is "+req.body.username);
	// register method hashes the password
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			console.log(err + "username  "+newUser.username);
			return res.render('register');
		}
		// if no error occurs, local strategy authentication takes place
    
		passport.authenticate('local')(req, res, () => {
			res.redirect('/');
		});
    
	});
})

/*
 app.post('/signup',passport.authenticate('local.signup',{
    successRedirect:'/profile',
    failureRedirect:'/signup',
    failureFlash:true
}));

*/
/*
router.get('/login',function(req,res){
res.render('login',{loginError:req.flash('loginError'),passwordError:req.flash('passwordError')});
});

*/



app.get('/login',(req,res) =>{
res.render.locals = req.user;
res.render('login',{message:{}});
});
/*
app.post('/login',passport.authenticate('local',{
successRedirect:'/',
failureRedirect:'/login',
failureFlash:true
}));

*/

app.post('/login', function(req, res, next) {
  session: false;
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
// user logout





app.get('/profileSearch',isLoggedIn,function(req,res){
  console.log(JSON.stringify(req.user));
    res.render('profile',{user:req.user});
});




app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

module.exports=app;



function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
} 

