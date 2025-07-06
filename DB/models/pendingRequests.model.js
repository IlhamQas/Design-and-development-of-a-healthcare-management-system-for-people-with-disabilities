import { Types, Schema , model } from "mongoose";
const pendingSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type:String,
        enum:['maneger', 'Specialist','guardian','admin','marketing_agents','guest'],
        default:'guest'
    },
    status:{
        type:String , 
        enum:['pending ', 'active', 'reject']
    },
    image:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now

    },

    balance: {
        type: Number,
        default: 0 
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    sendCode: {
        type: String,
        default: null
    },
},{timestamps:true})
const pendingModel=model('pending', pendingSchema)
export {pendingModel} 