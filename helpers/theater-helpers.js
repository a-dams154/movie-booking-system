var db=require('../config/connection')
var collection=require('../config/collection')
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
const { response } = require('express')
const { ObjectID, ObjectId } = require('mongodb')
module.exports={
    doLogin:(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            let loginstatus=false
            let response={}
            let owner=await db.get().collection(collection.OWNER_COLLECTION).findOne({email:userdata.email})
            if(owner){
                bcrypt.compare(userdata.Password,owner.password).then((status)=>{
                    if(status){
                        console.log('login success')
                        response.owner=owner
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
    addScreen:(screen,ownerId)=>{
      return new Promise((resolve,reject)=>{
          let screendet={
             ownerId:ObjectID(ownerId),screen
              
          }
        
         db.get().collection(collection.SCREEN_COLLECTION).insertOne(screendet).then((response)=>{
             resolve()
         })
      })
        

    },
    deleteOwner:(screenId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SCREEN_COLLECTION).removeOne({_id:ObjectID(screenId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    updateScreen:(screenId,screenDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SCREEN_COLLECTION).update({_id:objectId(screenId)},{
                $set:{
                    screen:
                    {
                        
                    ScreenName:screenDetails.ScreenName,
                    Seats:screenDetails.Seats}
                   
                }
            }).then((response)=>{
                resolve()           
            })
        })
    },
    
    getAllScreens:(ownerId)=>{
        return new Promise(async(resolve,reject)=>{
            let screen=await db.get().collection(collection.SCREEN_COLLECTION).find({"ownerId":ObjectID(ownerId)}).toArray()
            
            resolve(screen)
        })
    },
    getScreenDetails:(screenId)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.SCREEN_COLLECTION).findOne({_id:objectId(screenId)}).then((screen)=>{
            resolve(screen)
           })
               
        })
    },
    addMovie:(movie,callback)=>{
        console.log(movie)
        db.get().collection('movie').insertOne(movie).then((data)=>{
            callback(data.ops[0]._id)
        })
        

    },
    deleteMovie:(movieId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.MOVIE_COLLECTION).removeOne({_id:ObjectID(movieId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    getAllMovie:()=>{
        return new Promise(async(resolve,reject)=>{
            let movie=await db.get().collection(collection.MOVIE_COLLECTION).find().toArray()
            resolve(movie)
        })
    },
    getMovieDetails:(movieId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.MOVIE_COLLECTION).findOne({_id:objectId(movieId)}).then((movie)=>{
                resolve(movie)
            })
        })
    },
    updateMovie:(movieId,movieDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.MOVIE_COLLECTION).updateOne({_id:objectId(movieId)},{
                $set:{
                    MovieTitle:movieDetails.MovieTitle,
                    Cast:movieDetails.Cast,
                    Director:movieDetails.Director,
                    ReleaseDate:movieDetails.ReleaseDate,
                    RunTime:movieDetails.RunTime,
                    Language:movieDetails.Language,
                    Type:movieDetails.Type,
                    TrailerLink:movieDetails.TrailerLink

                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    addShow:(ownerId,showDetails)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.SCREEN_COLLECTION).updateOne({_id:ObjectId(ownerId)},{
            $push:{
               shows: {showid:new objectId(),
                MovieName:showDetails.MovieName,
                Date:showDetails.Date,
                ShowTime:showDetails.ShowTime,
                Vip:showDetails.Vip,
                Premium:showDetails.Premium,
                Executive:showDetails.Executive,
                Normal:showDetails.Normal,
            }
            }
        }).then((response)=>{
               resolve()
           })
        })
          
  
      },
      getAllShows:(ScreenId)=>{
        return new Promise(async(resolve,reject)=>{
            let shows=await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(ScreenId)}
                }
            ]).toArray()
            
            resolve(shows[0])
        })
    },
    getShowDetails:(showId)=>{
        return new Promise(async(resolve,reject)=>{
           let show = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {$unwind:"$shows"},
                {$match:{"shows.showid":objectId(showId)}},
                
            ]).toArray()
            resolve(show[0])
            
        })
        
    },
    updateShow:(showId,showDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SCREEN_COLLECTION).updateOne({'shows.showid':objectId(showId)},{
                '$set':{
                   
                        
                    'shows.$.MovieName':showDetails.MovieName,
                    'shows.$.Date':showDetails.Date,
                    'shows.$.ShowTime':showDetails.ShowTime,
                    'shows.$.Vip':showDetails.Vip,
                    'shows.$.Premium':showDetails.Premium,
                    'shows.$.Executive':showDetails.Executive,
                    'shows.$.Normal':showDetails.Normal
                    
                   
                }
            }).then((response)=>{
                resolve()           
            })
        })
    },
    deleteShow:(showId,screenId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.SCREEN_COLLECTION).updateOne({_id:objectId(screenId)},{
                $pull:{
                    shows:{
                        showid:objectId(showId)
                    }
                }
            
            }).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    }
}
