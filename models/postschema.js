const mongoose = require('mongoose') ;  

const postschema = new mongoose.Schema({
    title : { 
        type: String , 
        trim : true ,
        required : [true , "title is required"] , 
        minLength : [4, "title must be atleast 4 character long"] 
    } , 
    media : { 
        type : String , 
        required : [true , "media is required "] , 
    }   ,
    user: { 
        type: mongoose.Schema.Types.ObjectId , ref : 'user' ,
    } , 
    like : [{ 
        type : mongoose.Schema.Types.ObjectId , 
        ref : 'user' 
    }]
}, {
    timestamps: true 
})

const post = mongoose.model( 'post' , postschema); 

module.exports = post ; 