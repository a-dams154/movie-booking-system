const {
  response,
  text
} = require('express');
var express = require('express');
var router = express.Router();
var collection = require('../config/collection')
var db = require('../config/connection')
var userHelpers = require('../helpers/user-helpers.js');
const bodyparser = require('body-parser');
require('dotenv').config();




const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/otp-response')
  }
}

router.get('/', (req, res) => {
  let user = req.session.user

  userHelpers.getMalayalamMovie().then((malayalam) => {
    console.log(malayalam)

    userHelpers.getEnglishMovie().then((english) => {
      console.log(english)

      userHelpers.getTamilMovie().then((tamil) => {
        console.log(tamil)

        res.render('user/user-page', {
          malayalam,
          english,
          tamil,
          user
        })
      })
    })
  })
})
router.get('/user-login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/user-login', {
      userlogin: true,
      'loginErr': req.session.loginErr
    })
    req.session.loginErr = false
  }
})

router.post('/user-login', (req, res) => {
  return new Promise(async (resolve, reject) => {
    var number = req.body.number;
    let user = await db.get().collection(collection.USER_COLLECTION).findOne({
      number: req.body.number
    })
    if (user) {
      var otp = Math.random();
      otp = otp * 1000000;
      otp = parseInt(otp);
      console.log(otp);
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require('twilio')(accountSid, authToken);

      client.messages
        .create({
          body: 'Your bookme Verification code is ' + otp,
          from: '+18326378314',
          to: number
        })
      res.render('user/otp-response', {
        userlogin: true,
        otp: otp,
        name: user.name,
        'loginErr': req.session.loginErr
      })
      req.session.loginErr = false
    } else if(number=='+91') {
      req.session.loginErr = false
      res.redirect('/user-login')
    }else{
      req.session.loginErr=true
      res.redirect('/user-login')
    }
  })

})

router.post('/otp-response', function (req, res) {
  var name = req.body.name
  var token = req.body.token;
  var otp = req.body.otp
  if (otp == token) {
    req.session.loggedIn = true
    req.session.user = name
    console.log(req.session.user)
    console.log(token)
    res.redirect('/')
  } else{
    console.log('error',token,otp)
    var error = 'Invalid OTP'
    res.render('user/otp-response',{userlogin:true,name,otp,error})
  }
})

router.get('/user-signup', (req, res) => {
  res.render('user/user-signup', {
    userlogin: true
  })
})



// Create users endpoint
router.post('/user-signup', (req, res) => {

  var number = req.body.number
  var name = req.body.name
  var email = req.body.email

  var otp = Math.random();
  otp = otp * 1000000;
  otp = parseInt(otp);
  console.log(otp);

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  client.messages
    .create({
      body: 'Your bookme Verification code is ' + otp,
      from: '+18326378314',
      to: '+919496160158'
    })
  res.render('user/signup-otp-response', {
    userlogin: true,
    number: number,
    name: name,
    email: email,
    otp: otp
  })
});

router.post('/signup-otp-response', function (req, res) {

  var number = req.body.number
  var name = req.body.name
  var email = req.body.email
  var otp = req.body.otp
  var token = req.body.token
  if (otp == token) {
    req.session.loggedIn = true
    req.session.user = name
    res.redirect('/')
    db.get().collection(collection.USER_COLLECTION).insertOne({
      'number': number,
      'name': name,
      'email': email
    })
  } else {
    var error = 'Invalid OTP';
    res.render('user/signup-otp-response',{userlogin:true,number,name,email,otp,error})
  }


})

router.get('/user-profile', (req, res) => {
  let user = req.session.user
  console.log(req.params.id)
  res.render('user/user-profile', {
    user
  })
})

router.get('/movie/:id', async (req, res) => {
  let user = req.session.user
  let movie = await userHelpers.getMovieDetails(req.params.id)
  let format = await userHelpers.getFormat(movie.movie.MovieTitle)
  userHelpers.getMovieType(movie.movie.MovieTitle).then((movietype)=>{
  userHelpers.getRelatedMovie(movie.movie.Type).then((relatedmovie) => {
    console.log(movietype)
    console.log(relatedmovie)
    res.render('user/movie-details', {
      movie,
      relatedmovie,
      movietype,
      user
    })
    })
  })
})

router.get('/trailer/:id', async (req, res) => {
  let trailer = await userHelpers.getTrailer(req.params.id)
  res.render('user/trailer', {
    trailer
  })
  console.log(trailer.movie.MovieTitle)
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;