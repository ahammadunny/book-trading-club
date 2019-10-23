const mongoose = require('mongoose');
//const bcrypt=require('bcrypt-nodejs');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

/*
// Schema
const UserSchema1 = new mongoose.Schema({
  
  twitter: {
    id: {
      type: Number,
      unique: true
    },
    token: String,
    username: String
  },
  
  firstname: String,
  lastname: String,
  city: String,
  state: String
  
});


// Export
module.exports = mongoose.model('User', UserSchema);
usernameField: 'email',
  usernameQueryFields: ['email'],
  
*/ 

var UserSchema = new mongoose.Schema({

    username:String,
    email : String,
    id: {
      type: Number,
      unique: true,
      required:false
    },
    firstname: String,
    lastname:String,
    name: String,
    city: String,
    state: String

});





var options = {
//usernameField: 'email' || 'username',
//usernameQueryFields: ['email', 'username'],
    errorMessages: {
        MissingPasswordError: 'No password was given',
        AttemptTooSoonError: 'Account is currently locked. Try again later',
        TooManyAttemptsError: 'Account locked due to too many failed login attempts',
        NoSaltValueStoredError: 'Authentication not possible. No salt value stored',
        IncorrectPasswordError: 'Password or username are incorrect',
        IncorrectUsernameError: 'Password or username is incorrect',
        MissingUsernameError: 'No username was given',
        UserExistsError: 'A user with the given username is already registered'
        
    }
};

UserSchema.plugin(passportLocalMongoose,options);

//UserSchema.plugin(passportLocalMongoose);

const Email = mongoose.model('Email', UserSchema);

module.exports = Email;