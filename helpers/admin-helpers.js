var db=require('../config/connection')
var collection=require('../config/collection')
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
const { response } = require('express')
const { ObjectID } = require('mongodb')
module.exports={
    register:(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            userdata.Password=await bcrypt.hash(userdata.Password,10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(userdata).then((data)=>{
                resolve(data.ops[0])                
            })        
        })
        
    },
    doLogin:(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            let loginstatus=false
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:userdata.email})
            if(admin){
                bcrypt.compare(userdata.Password,admin.Password).then((status)=>{
                    if(status){
                        console.log('login success')
                        response.admin=admin
                        response.status=true
                        resolve(response)
                    }else{
                            console.log('login failed')
                            resolve({status:false})
                        }
                })
            }else{
                console.log('login failed')
                resolve({status:false})
            }
        })
    },
    
    addOwner:(owner,callback)=>{

        var password = generator.generate({
            length: 10,
            numbers: true
          });
          
          // 'uEyMTw32v9'
          console.log(password);

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                   user: 'sonauppaniyil@gmail.com',
                   pass: 'sonaappu123'
               }
           });
           const mailOptions = {
            from: 'sonauppaniyil@gmail.com', // sender address
            to: owner.email, // list of receivers
            subject: 'Your account created,use below mentioned username and password to signin', // Subject line
            html: '<table style="border: 1px solid red;">'+
    '<tr>'+
    '<td>Username: </td><td>'+owner.email+'</td>'+
    '</tr>'+
    '<tr>'+
    '<td>Password: </td><td>'+password+'</td>'+
    '</tr>'+
    '</table>'// plain text body
          // plain text body
        
          };
          transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
              console.log(info);
         });

        console.log(owner)
        owner.password=bcrypt.hashSync(password,10)                                                                                                    
        db.get().collection('owner').insertOne(owner).then((data)=>{
            callback(data.ops[0]._id)
        })
    },
    getAllOwner:()=>{
        return new Promise(async(resolve,reject)=>{
            let owner=await db.get().collection(collection.OWNER_COLLECTION).find().toArray()
            resolve(owner)
        })
    },
    deleteOwner:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.OWNER_COLLECTION).removeOne({_id:ObjectID(proId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    getOwnerDetails:(adminId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.OWNER_COLLECTION).findOne({_id:objectId(adminId)}).then((owner)=>{
                resolve(owner)
            })
        })
    },
    updateOwner:(adminId,adminDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.OWNER_COLLECTION).updateOne({_id:objectId(adminId)},{
                $set:{
                    Name:adminDetails.Name,
                    Theater_name:adminDetails.Theater_name,
                    Phone:adminDetails.Phone,
                    email:adminDetails.email

                }
            }).then((response)=>{
                resolve()
            })
        })
    }
    
}