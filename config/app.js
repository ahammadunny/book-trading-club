const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Book = require('../models/book');
const Trade = require('../models/trade');
const books = require('google-books-search');

router.get('/myBooks', isLoggedIn, function (req, res) {
  res.locals.id= req.user._id;
    Book.find({$or:[{ _user: req.user._id }, {owner:req.user._id}]}, function (err, books) {
        if (err) {
            return console.log(err);
        }
        if(!err) {
            res.render('myBooks', {
                title: 'profile page',
                books: books,
                user: req.user
            });
        }
    });
});

router.get('/search', function (req, res) {
    var title = req.query.title;

    books.search(title, function (err, results, apiResponse) {
        if (!err) {
            res.render('search', {
                title: `search page`,
                user:req.user,
                books: results
            });
        }
        else {
            console.log(err);
            res.status(404).send('File Not Found');
        }
    });
});





router.post('/profile/addBook', isLoggedIn, function (req, res) {
    var newBook = new Book();




    newBook.id = req.body.id;
    newBook.title = req.body.title;
    newBook.authors = req.body.authors;
    
    newBook.imageUrl = req.body.imageUrl;
    newBook._user = req.user._id;

    newBook.save(function (err) {
        if (err) {
            return console.log(err);
        }
res.redirect('/myBooks')  ;      

});

})

router.get('/remove-book/:bookId', isLoggedIn, (req, res) => {
  Book.findByIdAndRemove(req.params.bookId, (err, result) => {
    if (err) throw err;
    
    res.redirect('/myBooks');
  });
});
router.get("/contact/:IDE", isLoggedIn,function (request, response) {
    
   User.findById(request.params.IDE, function(err, doc){
     // console.log("theuser in the request.params.Ide is " +JSON.stringify(doc))
        if (err) throw err;
          response.render('contact', {auth:isLoggedIn, profile: doc});
      });
      
      });


router.get("/profile/contact/:ID", isLoggedIn,function (request, response) {
    
   User.findById(request.params.ID, function(err, doc){
      console.log("theuser in the request.params.Id is " +JSON.stringify(doc))
        if (err) throw err;
          response.render('contact', {auth:isLoggedIn, profile: doc});
      });
      
      });
  
router.get("/profile/edit", isLoggedIn, function (request, response) {
  
    
      
      User.findById( request.user._id,function(err, doc){
        if (err) throw err;
          console.log(doc);
          response.render('edit', { auth:isLoggedIn, profile: doc});
      });
    });
  
router.post("/profile/edit", function (request, response) {
  
    
    
    
    User.findByIdAndUpdate( request.user._id, {$set:{"firstname":request.body.nameInput, "city": request.body.cityInput, "state": request.body.stateInput}}, {upsert: true,new: true},(err, doc1)=>{
      if (err) throw err;
      response.redirect('/profile/edit');    
    });
  
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}