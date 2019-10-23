const mongoose=require('mongoose');
const User=require('./user.js');

const BookSchema=mongoose.Schema({
    id:String,
    title:String,
    authors:[String],
    publisher:String,
    description:String,
    link:String,
    imageUrl:String,
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    status:{
      
      
        type:String,
        enum:['available','pending'],
        default:'available'
    }
});

const Book=mongoose.model('Book',BookSchema);
module.exports=Book;