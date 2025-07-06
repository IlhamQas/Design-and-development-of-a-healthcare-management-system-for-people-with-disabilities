import { Types, Schema, model } from "mongoose";
import mongoose from "mongoose";
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0 
    },
    role: {
        type: String,
        enum: ['manager', 'specialist', 'guardian', 'admin', 'marketing_agents', 'guest'],
        default: 'guest'
    },
    image:{
    type:String
    },

    status: {
        type: String,
        enum: ['pending', 'active', 'reject'],
        default: 'active'
    },

    createdAt: {
        type: Date,
        default: Date.now

    },

    confirmEmail: {
        type: Boolean,
        default: false
    },
    department: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Department',
        default: undefined,
      
     },
      
    sendCode: {
        type: String,
        default: null
    },
    
    childStatus: {
        type: String,
        default: undefined
      },
      
    
}, 
{ timestamps: true })
const userModel = model('user', userSchema)
export { userModel } 