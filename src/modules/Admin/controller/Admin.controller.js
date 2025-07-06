import { userModel } from "../../../../DB/models/user.model.js";
import { DepartmentModel } from "../../../../DB/models/department.model.js";
import  EvaluationModel  from "../../../../DB/models/ChildEvaluation.model.js";
import GuardianScheduleModel  from '../../../../DB/models/GuardianSchedule.model.js';
import contactModel from "../../../../DB/models/Contact.model.js";
import { chatModel } from "../../../../DB/models/chat.model.js";
import medicalReportModel from "../../../../DB/models/medicalReportModel.js";
import { NotificationModel } from "../../../../DB/models/notification.model.js";
import orderModel from "../../../../DB/models/order.model.js";
import productModel from "../../../../DB/models/product.model.js";
import financialRecordModel from "../../../../DB/models/financialRecordModel.js";
import postModel from "../../../../DB/models/post.model.js";
import profileModel from "../../../../DB/models/profileModel.js";
import { SessionRecordModel } from '../../../../DB/models/sessionRecord.model.js';  
import  TreatmentPlanModel  from "../../../../DB/models/TreatmentPlan.model.js";
import DoctorScheduleModel from "../../../../DB/models/DoctorSchedule.model.js";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import { sendEmail } from "../../../Servicess/email.js";
import cloudenary from '../../../Servicess/cloudenary.js';




export const addUser=async(req,res)=>{
    const {name , email , password , role , childStatus }=req.body;
       try{
   const findUser=await userModel.findOne({email:email})
   if(findUser){
       return res.status(400).json({message:"هذا البريد مسجل مسبقا"})
   }
       if (!req.file) {
         return res.status(400).json({ message: "الصورة مطلوبة" });
     }
   
     const { secure_url } = await cloudenary.uploader.upload(req.file.path, {
         folder: "user/image/",
     });
   const hashPassword=await bcrypt.hash(password, parseInt(process.env.saltRound))
   
   console.log(name , email , password , role);
   let userData = {
       name,
       email,
       password: hashPassword,
       role,
       image: secure_url,
     };
     
   
     if (role === 'guardian') {
       const departmentNames = JSON.parse(req.body.departments);
       const departments = await DepartmentModel.find({ name: { $in: departmentNames } });
       
       if (departments.length === 0) {
         return res.status(404).json({ message: 'No valid departments found' });
       }
       userData.department = departments.map(dep => dep._id);
       userData.childStatus = childStatus;
     }
     
   
     const newUser = await userModel.create(userData);
     
   
     if (role === 'specialist') {
       const departmentName = req.body.department;
       const department = await DepartmentModel.findOne({ name: departmentName });
     
       if (!department) {
         return res.status(404).json({ message: 'Department not found' });
       }
     
       department.doctors.push({ doctorId: newUser._id, doctorName: newUser.name });
       await department.save();
     }
     
   
   const token=jwt.sign({id:newUser._id , name},process.env.confirmEmailToken,{expiresIn:'24h'})
   let message=`<!DOCTYPE html>
   <html>
   <head>
       <meta charset="utf-8">
       <meta http-equiv="x-ua-compatible" content="ie=edge">
       <title>Email Confirmation</title>
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <style type="text/css">
           a {
               color: #1a82e2;
           }
           img {
               height: auto;
           }
       </style>
   </head>
   <body style="background-color: #e9ecef;">
       <table border="0" cellpadding="0" cellspacing="0" width="100%">
           <tr>
               <td align="center" bgcolor="#e9ecef">
                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                       <tr>
                           <td align="center" valign="top" style="padding: 36px 24px;">
                               <a href="https://www.example.com" target="_blank" style="display: inline-block;">
                                
                               </a>
                           </td>
                       </tr>
                   </table>
               </td>
           </tr>
           <tr>
               <td align="center" bgcolor="#e9ecef">
                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                       <tr>
                           <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0;">
                               <h1>Confirm Your Email Address</h1>
                           </td>
                       </tr>
                   </table>
               </td>
           </tr>
           <tr>
               <td align="center" bgcolor="#e9ecef">
                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                       <tr>
                           <td align="left" bgcolor="#ffffff">
                                <a href="${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #fff; text-decoration: none; border-radius: 6px;background-color:hsl(94, 59%, 35%)">verify Email</a>
                           </td>
                       </tr>
                   </table>
               </td>
           </tr>
           <tr>
               <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                       <tr>
                           <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                               <p style="margin: 0;">maneger Project</p>
                           </td>
                       </tr>
                   </table>
               </td>
           </tr>
       </table>
   </body>
   </html>`
   
   const inf=await sendEmail(email , 'verify email', message)
   console.log(inf);
   
   if(inf.accepted.length){
       const user =await newUser.save()
       return res.status(200).json({ message: "sucsses", user });
   }else{
       return res.status(400).json({message:"خطأ في المعلومات المدخلة"})
   }
       }catch(error){ 
           return res.status(500).json({ message: `حدث خطأ أثناء إنشاء المستخدم: ${error.message}` });
       }
   
   }



export const showAllUser=async(req,res)=>{
    try{
const find=await userModel.find({});
res.status(200).json({message:"sucsses", find})
    }catch(error){
return res.status(500).json({message:`خطا في عرض المستخدمين: ${error.message}`})
    }
}


export const showUserById=async(req,res)=>{
    try{
const {id}=req.params;
const findUser=await userModel.findById(id);
if(!findUser){
    res.status(404).json({message:"مش موجود"})
}else{
    res.status(200).json({message:"succsses", findUser})
}
    }catch(error){
        return res.status(500).json({message:`خطا في عرض المستخدم : ${error.message}`})
    }
}



export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    await EvaluationModel.deleteMany({ 
      $or: [{ guardianId: id }]
    });
    await GuardianScheduleModel.deleteMany({ guardianId: id });
    await chatModel.deleteMany({ $or: [{ senderId: id }, { receiverId: id }]});
    await medicalReportModel.deleteMany({
      $or: [{ patientId: id }, { specialistId: id }]
    });    
    await NotificationModel.deleteMany({ senderId: id });
    await orderModel.deleteMany({ userId: id });
    await productModel.deleteMany({ createdBy: id });
    await financialRecordModel.deleteMany({ userId: id });
    await postModel.deleteMany({ userId: id });
    await profileModel.deleteOne({ userId: id });
    await SessionRecordModel.deleteMany({ $or: [{ doctorId: id }, { guardianId: id }]});
    await TreatmentPlanModel.deleteMany({ guardianId: id });
    await DoctorScheduleModel.deleteMany({doctor: id});

    const deletedUser = await userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(400).json({ message: "خطأ في حذف المستخدم" });
    }

    return res.status(200).json({ message: "تم حذف المستخدم وكل البيانات المرتبطة به بنجاح", deletedUser });
  } catch (error) {
    return res.status(500).json({ message: `حدث خطأ: ${error.message}` });
  }
};



export const updateUser=async(req,res)=>{
    const {id}=req.params;
    const {name , password , email , role }=req.body;
    try{
        const findUser=await userModel.findById(id)
        if(!findUser){
            return res.status(404).json({message:'المستخدم مش موجود'})
        }else{
            const finduserAndUpdate=await userModel.findByIdAndUpdate(id , {
                name:name || findUser.name,
                email:email || findUser.email,
                password:password|| findUser.password,
                role:role || findUser.role,
              
            },{new:true})
            res.status(200).json({message:"succsses", finduserAndUpdate})
        }

    }catch(error){
        return res.status(500).json({message:`حدث خطا ${error.message}`}) 
    }
}


export const getManagers = async (req, res) => {
    try {
      const managers = await userModel.find({
        role: { $in: ['admin', 'manager'] }
      }).select('-password'); 
  
      if (managers.length === 0) {
        return res.status(404).json({ message: "لا يوجد مدير أو أدمن" });
      }
  
      return res.status(200).json({ message: "تم بنجاح", managers });
    } catch (error) {
      return res.status(500).json({ message: `حدث خطأ أثناء جلب البيانات: ${error.message}` });
    }
  };
  

  
export const getSystemStats = async (req, res) => {
    try {
      const totalUsers = await userModel.countDocuments();
  
      const roleCounts = await userModel.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]);
  
      const departmentsCount = await DepartmentModel.countDocuments();

      const confirmedUsers = await userModel.countDocuments({ confirmEmail: true });
  
      const stats = {
        totalUsers,
        roleCounts: roleCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        departmentsCount,
        confirmedUsers
      };
  
      res.status(200).json({ message: "إحصائيات النظام", stats });
    } catch (error) {
      res.status(500).json({ message: `فشل في جلب الإحصائيات: ${error.message}` });
    }
  };