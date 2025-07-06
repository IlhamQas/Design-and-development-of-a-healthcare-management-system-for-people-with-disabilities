import { appointmentModel } from "../../../../DB/models/appointment.model.js";
import { pendingAppointmentModel } from "../../../../DB/models/pendingAppointment.model.js";
import { sendEmail } from "../../../Servicess/email.js";


export const controlPending = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const findPending = await pendingAppointmentModel.findById(id);
      if (!findPending) {
        return res.status(404).json({ message: "Appointment request not found" });
      }
  
      if (status === "approved") {
        const newAppointment = new appointmentModel({
          name: findPending.name, 
          status: status,
          notes: findPending.notes,
          email: findPending.email,
          phonenumber: findPending.phonenumber,
          date: findPending.date,
          createdAt: findPending.createdAt,
          createdBy: req.user ? req.user._id : null
        });
  
        await newAppointment.save();
  
        await sendEmail(
          findPending.email,
          "Appointment Confirmation",
          `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8" />
            <title>Appointment Confirmation</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; text-align: center; }
              .container { background-color: #ffffff; width: 80%; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              h2 { color: #4CAF50; }
              p { font-size: 16px; color: #333; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>📅 Appointment Confirmed</h2>
              <p>Dear <strong>${findPending.name}</strong>,</p>
              <p>Your appointment request has been approved.</p>
              <p><strong>Date:</strong> ${findPending.date}</p>
              <p>Thank you for using our platform.</p>
            </div>
          </body>
          </html>
          `
        );
  
        await pendingAppointmentModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "Success: Appointment Accepted" });
  
      } else if (status === "cancelled") {
        await sendEmail(
          findPending.email,
          "Appointment Rejection Notice",
          `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8" />
            <title>Appointment Rejection</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; text-align: center; }
              .container { background-color: #ffffff; width: 80%; max-width: 600px; margin: 30px auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              h2 { color: #d9534f; }
              p { font-size: 16px; color: #333; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>❌ Appointment Rejected</h2>
              <p>Dear <strong>${findPending.name}</strong>,</p>
              <p>We regret to inform you that your appointment request was rejected.</p>
              <p>You can try booking a new appointment later.</p>
            </div>
          </body>
          </html>
          `
        );
  
        await pendingAppointmentModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "Success: Appointment Rejected" });
  
      } else {
        return res.status(400).json({ message: "Invalid status value" });
      }
    } catch (error) {
      return res.status(500).json({ message: `Error: ${error.message}` });
    }
  };



export const deleteAppintment=async(req,res)=>{
    const {id}=req.params;
    try{
        const findAppointment=await appointmentModel.findById(id);
        if(!findAppointment){
            return res.status(400).json({message:"not found"})
        } else{
            const deleteUserAppointment=await appointmentModel.findByIdAndDelete(id)
            return res.status(200).json({message:"succsses", deleteUserAppointment})
        }

    }catch(error){
        return res.status(500).json({message:`error ${error}`}) 
    }
}



export const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { date } = req.body;
  
    try {
      const findAppointment = await appointmentModel.findById(id);
      if (!findAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
  
      const updatedFields = {
        date: isValidDate(date) ? new Date(date) : findAppointment.date,
        modifiedRequest: true,
        modifiedDate: new Date(),
      };
  
      const updatedAppointment = await appointmentModel.findByIdAndUpdate(
        id,
        updatedFields,
        { new: true }
      );
 
  
      await sendEmail(
        findAppointment.email,
        "🔄 Appointment Updated",
        `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Appointment Updated</title></head>
        <body style="font-family: Arial; text-align: center;">
          <div style="background: #fff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
            <h2 style="color: #f0ad4e;">🔄 Your Appointment Has Been Updated</h2>
            <p>Dear <strong>${findAppointment.name}</strong>,</p>
            <p>Your appointment date has been updated. Here is the new date:</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
              <p><strong>📅 Date:</strong> ${new Date(updatedFields.date).toLocaleString()}</p>
            </div>
            <a style="display: inline-block; margin-top: 15px; background-color: #f0ad4e; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Cancel Appointment</a>
            <p style="margin-top: 20px; color: #666;">🚀 The Appointments Team</p>
          </div>
        </body>
        </html>
        `
      );
  
      return res.status(200).json({ message: "Update successful", updatedAppointment });
    } catch (error) {
      return res.status(500).json({ message: `Error: ${error.message}` });
    }
  };
  
  function isValidDate(date) {
    const d = new Date(date);
    return !isNaN(d);
  }
  
  

export const showAll=async(req , res)=>{
    try{
        const findAll=await appointmentModel.find({})
        if(!findAll){
            return res.status(400).json({message:"not found"})
        }else{
            return res.status(200).json({message:"succsses", findAll})
        }


    }catch(error){
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
}


export const showById=async(req,res)=>{
    const {id}=req.params;
    const find=await appointmentModel.findById(id);
    if(!find){
        return res.status(400).json({message:"not found"})

    }else{
        return res.status(200).json({message:"succsses", find})

    }
}