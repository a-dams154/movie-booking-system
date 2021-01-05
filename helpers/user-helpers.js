var db=require('../config/connection')
var collection=require('../config/collection')
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
const { response } = require('express')
const { ObjectID, ObjectId } = require('mongodb')
module.exports={

    getAllMovie:()=>{
        return new Promise(async(resolve,reject)=>{
            let movie=await db.get().collection(collection.MOVIE_COLLECTION).find().toArray()
            resolve(movie)
        })
    }
}