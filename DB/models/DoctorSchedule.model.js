import mongoose from "mongoose";

const DoctorScheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  ManegerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  availableSlots: [{
    dayOfWeek: { 
      type: String, 
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], 
      required: true 
    },
    times: [{ type: String }],
    details:{
      type: String, 
      required:true
    }
  }]
}, { timestamps: true });

const DoctorScheduleModel = mongoose.model("DoctorSchedule", DoctorScheduleSchema);
export default DoctorScheduleModel;
