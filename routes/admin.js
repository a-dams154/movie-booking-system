const { response, text } = require('express');
var express = require('express');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers.js');


const { route } = require('./index.js');

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/admin/adminlogin')
  }
}
/* GET home page. */

router.get('/',verifyLogin,(req, res)=>{
  
  let user=req.session.admin
  console.log(user)
  res.render('admin/dashboard',{user})
});
router.get('/add_owner',function(req,res){
  res.render('admin/add_owner')

})
router.post('/add_owner',(req,res)=>{

  console.log(req.body);
  console.log(req.files.image);
  adminHelpers.addOwner(req.body,(id) =>{
    let image=req.files.image
    console.log(id)
    image.mv('./public/owner-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add_owner')
      }else{
        console.log(err)
      }
    })
    res.render('admin/add_owner')
  })

})
router.get('/dashboard',verifyLogin,(req,res)=>{
  let user=req.session.admin
  res.render('admin/dashboard',{user})
})
router.get('/theater-management',verifyLogin,(req,res)=>{
  let user=req.session.admin
  adminHelpers.getAllOwner().then((owner)=>{
    console.log(owner)
    res.render('admin/theater-management',{owner,user})
  })
})
router.get('/users-management',(req,res)=>{
  let user=req.session.admin
  res.render('admin/users-management',{user})
})
router.get('/users-activity',(req,res)=>{
  res.render('admin/users-activity')
})
router.get('/delete-owner/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId)
  adminHelpers.deleteOwner(proId).then((response)=>{
    res.redirect('/admin/theater-management')
  })
})
router.get('/edit-owner/:id',async(req,res)=>{
  let owner=await adminHelpers.getOwnerDetails(req.params.id)
  console.log(owner)
  res.render('admin/edit-owner',{owner})
})
router.post('/edit-owner/:id',(req,res)=>{
  let id=req.params.id
  adminHelpers.updateOwner(req.params.id,req.body).then(()=>{
    res.redirect('/admin/theater-management')
    if(req.files.image){
      let image=req.files.image
      image.mv('./public/owner-images/'+id+'.jpg')
    }
  })
})
router.get('/view-owner/:id',async(req,res)=>{
  let owner=await adminHelpers.getOwnerDetails(req.params.id)
  console.log(owner)
  res.render('admin/view-owner',{owner})
})
router.get('/adminlogin',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/admin')
  }else{
  res.render('admin/admin-login',{adminlogin:true,'loginErr':req.session.loginErr})
  req.session.loginErr=false
  }
})
router.post('/adminlogin',(req,res)=>{
  console.log(req.body)
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.admin=response.admin
      res.redirect('/admin')
    }else{
      req.session.loginErr=true
      res.redirect('/admin/adminlogin')
    }
  })
})
router.get('/register',(req,res)=>{
  res.render('admin/register',{adminlogin:true})
})
router.post('/register',(req,res)=>{
  adminHelpers.register(req.body).then((response)=>{
    console.log(response)
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/admin/adminlogin')
})

module.exports = router;
