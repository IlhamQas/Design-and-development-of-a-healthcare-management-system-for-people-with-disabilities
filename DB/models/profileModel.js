import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, unique: true }, 
    bio: { type: String, default: "" }, 
  
    phone: { type: String, default: "" }, 
    address: { type: String, default: "" }, 
    specialization: { type: String, default: "" }, 
    workplace: { type: String, default: "" }, 
    createdAt: { type: Date, default: Date.now }
});

const profileModel = mongoose.model("Profile", profileSchema);
export default profileModel;