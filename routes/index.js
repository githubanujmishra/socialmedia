var express = require('express');
var router = express.Router();

const sendmail = require('../utils/mail') ; 

const upload = require('../utils/multer') ; 

const fs = require('fs'); 
const path = require('path'); 

const post = require('../models/postschema') ; 


const user = require('../models/userschema') ; 
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(user.authenticate()));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user : req.user});
});


router.get('/login', function(req, res, next) {
  res.render('login' ,  { user : req.user}) ; 
});

router.get('/register', function(req, res, next) {
  res.render('register' ,  { user : req.user}) ; 
});

router.post('/register',async function(req, res, next) {
  try {
    // const newuser =new  user(req.body); 
    // await newuser.save() ; 
    console.log(req.body);
    const { name , username , email , password } = req.body  ; 
    await user.register({name , username , email} , password ) ; 
    res.redirect('/login') ; 
  } catch (error) {
    res.send(error); 
  } 
});
  

router.post('/loginuser' , passport.authenticate('local' , {
  successRedirect : '/profile'  , 
  failureRedirect : '/login' , 
}) , function (req ,res, next ) {}
); 

router.get('/logoutuser' , function(req ,res, next ){ 
  req.logout(() => { 
    res.redirect('/login' ) ; 
  })
})

function isloggedin( req ,res, next ){ 
  if( req.isAuthenticated()) {
    next() ; 
  }else { 
    res.redirect('/login');
  }
}

router.get('/about', function(req, res, next) {
  res.render('about' ,  { user : req.user}) ; 
});


router.get('/profile', isloggedin ,async  function(req, res, next) {
  // res.render('profile' ,  { user : req.user}) ; 
  try{
    const posts = await post.find().populate('user') ; 
    res.render('profile' , { user : req.user , posts})
  }catch{ 
    res.send(error); 
  }
});


router.get('/updateuser/:id' , isloggedin , function(req , res, next){ 
  res.render('userupdate' , { user : req.user }) ; 
})

router.post('/image/:id' , isloggedin , upload.single('profilepic') ,async  function(req ,res , next ) { 
  try {
    if ( req.user.profilepic !== 'default.png'){
      fs.unlinkSync(path.join(__dirname , '../' , 'public' , 'images' , req.user.profilepic ))
    }
    req.user.profilepic = req.file.filename ; 
    await req.user.save() ; 
    res.redirect(`/updateuser/${req.params.id}`) ; 
  } catch (error) {
    res.send(error)
  } 
} )

router.get('/resetpassword/:id' , isloggedin , function(req , res, next){ 
  res.render('resetpassword' , { user : req.user }) ; 
})

router.post('/resetpassword/:id' , isloggedin ,async  function(req , res, next){ 
  try {
    await req.user.changePassword(
        req.body.oldpassword,
        req.body.newpassword
    );
    req.user.save();
    res.redirect(`/updateuser/${req.user._id}`);
} catch (error) {
    res.send(error);
}
})

router.get('/forgetemail' , function(req ,res, next ) { 
  res.render('forgetemail' , {user : req.user }); 
})

router.post("/forgetemail", async function (req, res, next) {
  try {
      const User = await user.findOne({ email: req.body.email });
      // res.redirect(`/forgetpassword/${ User._id}`)
      if (User) {
          // res.redirect(`/forgetpassword/${User._id}`);
          // sendmail(res , req.body.email , User ) ; 
          const url = `${req.protocol}://${req.get('host')}/forgetpassword/${User._id}`
          console.log(url);
          sendmail(res , User , url )
      } else {
          res.redirect("/forgetemail");
      }
  } catch (error) {
      res.send(error);
  }
});

router.get('/forgetpassword/:id' , function(req ,res , next ) { 
  res.render('forgetpassword' , { user : req.user ,  id: req.params.id }) ; 
} )

router.post('/forgetpassword/:id' ,async function(req, res, next){ 
  try {
    const User = await user.findById(req.params.id); 
    if ( User.resetpasswordtoken === 1 ){ 
      await User.setPassword(req.body.password) ; 
      User.resetpasswordtoken = 0 ; 
      await User.save(); 
      res.redirect('/login') ; 
    }
    else{ 
      res.send('link expired try again') ; 
    }
    // res.redirect('/login'); 
  } catch (error) {
    res.send(error) ; 
  }
})

router.get('/deleteuser/:id' , isloggedin ,async function( req ,res , next){ 
  try {
    const deleteduser =  await user.findByIdAndDelete(req.params.id ); 
    if ( deleteduser.profilepic !== 'default.png'){
      fs.unlinkSync(path.join(__dirname , '../' , 'public' , 'images' , req.user.profilepic ))
    }
    deleteduser.posts.forEach(async (postid ) => { 
      const deletedpost = await post.findByIdAndDelete(postid) ; 
      fs.unlinkSync(path.join(__dirname , "../" , 'public' , "images"  , deletedpost.media ))
    } )
    res.redirect('/login') ; 
  } catch (error) {
    res.send(error); 
  }
})

router.get('/postcreate' , isloggedin , function (req ,res , next ) { 
  res.render('postcreate' , { user : req.user }); 
})

router.post('/postcreate' , isloggedin , upload.single('media') , async function( req,res ,next ) { 
    try {
      const newpost = new post({
        title : req.body.title , 
        media : req.file.filename ,
        user : req.user._id 
      })

      req.user.posts.push(newpost._id ); 

      await newpost.save(); 
      await req.user.save() ; 
      
      res.redirect('/profile'); 

    } catch (error) {
      res.send(error) ; 
    }
} )

router.get('/like/:postid' , isloggedin ,  async function (req , res , next ) { 
  try {
    const posts = await post.findById(req.params.postid);  
    if (posts.like.includes(req.user._id )){ 
      posts.like = posts.like.filter((uid ) => uid != req.user.id  )
    }else{ 
      posts.like.push(req.user._id) ; 
    }
    await posts.save() ; 
    res.redirect('/profile') ; 
  } catch (error) { 
    res.send(error) ;
  }
})

router.get('/timeline' , isloggedin ,async function(req , res , next ) { 
  try {
    res.render('timeline' , { user : await req.user.populate('posts') })
  } catch (error) {
    res.send(error);
  }
})

router.get('/deletepost/:id' , isloggedin , async function(req ,res , next ) { 
  try {
    const deletepost = await post.findByIdAndDelete(req.params.id); 
    fs.unlinkSync(path.join(__dirname , "../",  "public" , "images" , deletepost.media  )) 
    res.redirect('/timeline') ; 
  } catch (error) {
    res.send(error); 
  }
} )

console.log("hello");

module.exports = router;
