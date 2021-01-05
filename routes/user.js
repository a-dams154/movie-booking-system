const { response, text } = require('express');
var express = require('express');
var router = express.Router();
var userHelpers=require('../helpers/user-helpers.js');
var mongoose = require('mongoose');

router.get('/',(req,res)=>{
  userHelpers.getAllMovie().then((movie)=>{
    console.log(movie)
    res.render('user/user-page',{movie})
  })
})
module.exports = router;
