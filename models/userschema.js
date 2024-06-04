const mongoose = require('mongoose') ; 
const plm = require('passport-local-mongoose');  


const userschema = new mongoose.Schema({
    profilepic : { 
        type : String ,
        default : "default.png" 
    } , 
    name : {
        type : String , 
        trim : true , 
        required : [true , "name is required"], 
        minLength : [4 , "name must be atleast 4 characters long"]
    }, 
    username : { 
        type : String , 
        trim : true , 
        unique : true , 
        index:true,
        required : [true , "full name is required"] , 
        minLength : [4 , "username must be atleast 4 characters long"],
    },
    email : { 
        type : String , 
        trim : true , 
        unique : true , 
        lowercase : true , 
        required : [true , "email is required"] , 
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password : String , 
    posts : [{ 
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'post' 
    }] , 
    resetpasswordtoken : { 
        type : Number , 
        default : 0 
    }  
}, 
{ timestamps : true}) ;


userschema.plugin(plm); 

const user = mongoose.model('user' , userschema) ; 

module.exports = user  ; 