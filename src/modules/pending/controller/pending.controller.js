import { pendingModel } from "../../../../DB/models/pendingRequests.model.js";
import { userModel } from "../../../../DB/models/user.model.js";
import { sendEmail } from "../../../Servicess/email.js";

export const proccesPendingReq=async(req , res)=>{
    const {id}=req.params;
  
    const {status , role}=req.body;

   
    try{
       
        const findPindeing=await pendingModel.findById(id)
  
            if(status=='active'){
                const newUser=new userModel({
                    name:findPindeing.name,
                    email:findPindeing.email,
                    password:findPindeing.password,
                    confirmEmail:findPindeing.confirmEmail,
                    image:findPindeing.image,
                    role:role,
                 
                })
             await  sendEmail(findPindeing.email , "تنشيط الحساب","تم تنشيط الحساب ")
                await newUser.save();
                await pendingModel.findByIdAndDelete(id)
                return res.status(200).json({message:"succsses user is active"})
            } else if(status=='reject'){
            await   sendEmail(findPindeing.email , "تنشيط الحساب","تم رفض الحساب ")
                await pendingModel.findByIdAndDelete(id)
                return res.status(200).json({ message: 'User request rejected and deleted' });
            }else{
                return res.status(400).json({ message: 'Invalid status value' });
    
            }
        

     
    }catch(error){
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
}
