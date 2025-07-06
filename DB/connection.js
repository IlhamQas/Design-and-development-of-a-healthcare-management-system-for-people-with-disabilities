import mongoose from "mongoose";
const connectDB=async()=>{      // الاتصال بشكل غير متزامن
    return await mongoose.connect(process.env.DBURL)
    .then(res=>{
        console.log("connected ")
    }).catch(error=>{
        console.log(`fail connect ${error}`)
    })
}
export default connectDB;

