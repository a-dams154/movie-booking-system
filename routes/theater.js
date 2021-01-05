const { response, text } = require('express');
var express = require('express');
var router = express.Router();
var theaterHelpers=require('../helpers/theater-helpers.js');
var mongoose = require('mongoose');

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/theater/theaterlogin')
  }
}

/* GET home page. */

router.get('/',verifyLogin,(req,res)=>{
  let user=req.session.owner
  console.log(user)
    res.render('theater/dashboard',{theater:true,user})
  });

  router.get('/theaterlogin',(req,res)=>{
    res.render('theater/theater-login',{theaterlogin:true})
  });

  router.post('/theaterlogin',(req,res)=>{
    console.log(req.body)
    theaterHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.owner=response.owner
        res.redirect('/theater')
      }else{
        req.session.loginErr=true
        res.redirect('/theater/theaterlogin')
      }
    })
  })

  router.get('/dashboard',(req,res)=>{
    res.render('theater/dashboard',{theater:true})
  })

  router.get('/screens',verifyLogin,(req,res)=>{
    let user=req.session.owner
    theaterHelpers.getAllScreens(req.session.owner._id).then((screen)=>{
      res.render('theater/screens',{user,screen,theater:true})
      console.log(screen)
    })
  })

  router.get('/add-screen',(req,res)=>{
    let user=req.session.owner
    res.render('theater/add-screen',{user,theater:true})
  });

  router.post('/add-screen',(req,res)=>{

    theaterHelpers.addScreen(req.body,req.session.owner._id).then(()=>{
      
    res.redirect('/theater/screens')
    })
    });
  
    router.get('/delete-screen/:id',(req,res)=>{
      let proId=req.params.id
      console.log(proId)
      theaterHelpers.deleteOwner(proId).then((response)=>{
        res.redirect('/theater/screens')
      })
    })

    router.get('/edit-screen/:id',async(req,res)=>{
      let screen = await theaterHelpers.getScreenDetails(req.params.id)
      let user=req.session.owner
      console.log(screen)
      res.render('theater/edit-screen',{user,screen,theater:true})
    })

    router.post('/edit-screen/:id',(req,res)=>{
      
      theaterHelpers.updateScreen(req.params.id,req.body).then(()=>{
        console.log(req.body)
        res.redirect('/theater/screens')
      })
    })

    router.get('/movie-management',verifyLogin,(req,res)=>{
      let user=req.session.owner
      theaterHelpers.getAllMovie(req.session.owner._id).then((movie)=>{
        res.render('theater/movie-management',{user,movie,theater:true})
        console.log(movie)
        console.log(req.session.owner._id)
      })
    })

    router.get('/add-movie',(req,res)=>{
      let user = req.session.owner
      res.render('theater/add-movie',{user,theater:true})
    });

    router.post('/add-movie',(req,res)=>{

      console.log(req.body);
      console.log(req.files.MoviePoster);
      theaterHelpers.addMovie(req.session.owner._id,req.body,(id)=>{
      let image=req.files.MoviePoster
      let Poster=req.files.Poster
      console.log(id)
      image.mv(('./public/movie-poster/'+id+'.jpg'),Poster.mv('./public/movie-poster/'+id+id+'.jpg',),(err,done)=>{
      if(!err){
        res.render('/theater/movie-management')
      }else{
        console.log(err)
      }

     
    
    })
    res.render('theater/movie-management')
      })
      res.redirect('/theater/movie-management')

      });

      router.get('/delete-movie/:id',(req,res)=>{
        let proId=req.params.id
        console.log(proId)
        theaterHelpers.deleteMovie(proId).then((response)=>{
          res.redirect('/theater/movie-management')
        })
      })

      router.get('/edit-movie/:id',async(req,res)=>{
        let movie=await theaterHelpers.getMovieDetails(req.params.id)
        console.log(movie)
        res.render('theater/edit-movie',{movie,theater:true})
      })

      router.post('/edit-movie/:id',(req,res)=>{
        let id=req.params.id
        theaterHelpers.updateMovie(req.params.id,req.body).then(()=>{
          res.redirect('/theater/movie-management')
          if(req.files.MoviePoster,req.files.Poster){
            let image=req.files.MoviePoster
            let Poster=req.files.Poster
            image.mv('./public/movie-poster/'+id+'.jpg')
            Poster.mv('./public/movie-poster/'+id+id+'.jpg')
          }
        })
      })

      router.get('/add-show/:screenid',(req,res)=>{
        user=req.session.owner
        screenid=req.params.screenid
        res.render('theater/add-show',{screenid,user,theater:true})
      });

      router.post('/add-show/:screenid',(req,res)=>{
        theaterHelpers.addShow(req.params.screenid,req.body).then(()=>{
          res.redirect('/theater/view-shedule/'+req.params.screenid)
          console.log(req.params.id)
          console.log(req.body)
        })
        })   

        router.get('/view-shedule/:id',verifyLogin,async(req,res)=>{
          let user=req.session.owner
          let details = await theaterHelpers.getAllShows(req.params.id)
          res.render('theater/view-shedule',{user,showlist:details.shows,screenid:details._id,screenname:details.screen.ScreenName,theater:true})
          
          })
          router.get('/edit-show/:id',async(req,res)=>{
            let user=req.session.owner
            let showid=req.params.id
            let details=await theaterHelpers.getShowDetails(req.params.id)
            res.render('theater/edit-show',{show:details.shows,screenid:details._id,showid,user,theater:true})
            console.log(details)
          })

          router.post('/edit-show/:showid/:screenid',(req,res)=>{
      
            theaterHelpers.updateShow(req.params.showid,req.body).then(()=>{
              res.redirect('/theater/view-shedule/'+req.params.screenid)
            })
          })

          router.get('/delete-show/:id/:screenid',(req,res)=>{
            console.log(req.params.id)
            console.log(req.params.screen)
            theaterHelpers.deleteShow(req.params.id,req.params.screenid).then((response)=>{
              res.redirect('/theater/view-shedule/'+req.params.screenid)
            })
          })

          router.get('/users-activity',(req,res)=>{
            let user=req.session.owner
            res.render('theater/users-activity',{user,theater:true})
          })
        
  router.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/theater/theaterlogin')
  })

  module.exports = router;
