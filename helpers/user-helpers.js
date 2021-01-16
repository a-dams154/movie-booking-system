var db=require('../config/connection')
var collection=require('../config/collection')
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
const { response } = require('express')
const { ObjectID, ObjectId } = require('mongodb');
const { RequestHeaderFieldsTooLarge } = require('http-errors');
var messagebird = require('messagebird')('AHYCC091oHn7yOytDliUZWW8B');
module.exports={

    getMalayalamMovie:()=>{
        return new Promise(async(resolve,reject)=>{
            let malayalam=await db.get().collection(collection.MOVIE_COLLECTION).aggregate([
                {$unwind:"$movie"},
                {$match:{"movie.Language":'Malayalam'}}
            ]).toArray()
            resolve(malayalam)
        })
    },
    getEnglishMovie:()=>{
        return new Promise(async(resolve,reject)=>{
            let english=await db.get().collection(collection.MOVIE_COLLECTION).aggregate([
                {$unwind:"$movie"},
                {$match:{"movie.Language":'English'}}
            ]).toArray()
            resolve(english)
        })
    }
   
}