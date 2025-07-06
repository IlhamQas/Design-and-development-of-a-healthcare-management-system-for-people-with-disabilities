import mongoose from "mongoose";
const postSchema=new mongoose.Schema({
    doctorName:{
        type:String,
        required:true
    },
    DateOfPost:{
        type:Date,
        required:true
    },
    postDesc:{
        type:String , 
        required:true
    },
    photo:{
        type:String,
        required:false
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
         ref: "user", 
        
    }

})
const postModel=mongoose.model('post',postSchema)
export default postModel;