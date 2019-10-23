const express = require('express');
const app = express();
const router = express.Router();
const books = require('google-books-search');
//const isLoggedIn = require('../util').isLoggedIn;
const Book = require('../models/book');
const Trade = require('../models/trade');

const User = require('../models/user');





// Trades
router.get('/trades', isLoggedIn, (req, res) => {
  Trade.find({ to: req.user._id, status: 'pending' })
    .populate('book1 book2 from to')
    .exec((err, trades) => {
      if (err) throw err;
    console.log("trades are "+JSON.stringify(trades));
      
      res.render('trades', { trades });
    });
});

router.get('/profile/trade/:bookId', (req, res) => {
  res.locals.user = req.user;
  res.locals.id = req.user._id
  Book.findById(req.params.bookId, (err, book) => {
    if (err) throw err;
  //  console.log(JSON.stringify(req.user));
    Book.find({ _user: req.user._id }, (err, books) => {
      if (err) throw err;
      
      res.render('exchange2', { book:book, myBooks: books });
    })
  });
});

router.get('/trade/request/:book1Id/:book2Id', isLoggedIn, (req, res) => {
  Book.findById(req.params.book1Id, (err, book) => {
    if (err) throw err;
   
    
    const newTrade = new Trade({
      book1: req.params.book1Id,
      book2: req.params.book2Id,
      from: req.user._id,
      to: book._user
    });
console.log("user1 is "+ newTrade.from+ "  "+"user2 is "+newTrade.to)
    newTrade.save(err => {
      if (err) throw err;

      res.redirect('/trades');
    });
  });
});

router.get('/trade/accept/:tradeId', isLoggedIn, (req, res) => {
  Trade.findByIdAndUpdate({ _id: req.params.tradeId }, { status: 'approved' }, (err, trade) => {
    if (err) throw err;
    console.log("fhe trade is "+trade);
    // Swap books
    Book.findByIdAndUpdate(trade.book2, { _user: trade.to }, (err, result) => {
      if (err) throw err;
      console.log( "book2 is "+result)
      Book.findByIdAndUpdate(trade.book1, { _user: trade.from }, (err, result) => {
        if (err) throw err;
      console.log("book1 is "+result)
     //   res.redirect('/trades');
      });
    });
   trade.remove(function (err) {
                            if (err) {
                                return console.log(err);

                            }
                            res.redirect('/trades');
                        }); 
  });
});

router.get('/trade/reject/:tradeId', (req, res) => {
  Trade.findByIdAndRemove(req.params.tradeId, (err, result) => {
    if (err) throw err;
    
    res.redirect('/');
  });
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;