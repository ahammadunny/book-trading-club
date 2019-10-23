const mongoose = require('mongoose');
const User = require('/app/models/user')

// Schema
const BookSchema = new mongoose.Schema({

  createdAt: {
    type: Date,
    default: Date.now
  },
  
  
  
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  owner:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  
  status: String,
  title: String,
  imageUrl: String,
  image: String,
  thumb: String,
  uid: String,
  noimage: String

    
});


// Export
module.exports = mongoose.model('Book', BookSchema);