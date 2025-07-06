
import DoctorScheduleModel from "../../../../DB/models/DoctorSchedule.model.js";
import GuardianScheduleModel from "../../../../DB/models/GuardianSchedule.model.js";
import {DepartmentModel} from "../../../../DB/models/department.model.js"; 
import { userModel } from "../../../../DB/models/user.model.js";



export const displayDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.params.id || req.user._id;
    console.log(doctorId);

    const doctorSchedule = await DoctorScheduleModel.findOne({ doctor: doctorId });
    if (!doctorSchedule)
      return res.status(404).json({ message: "No schedule found for the doctor." });


    const guardianSchedules = await GuardianScheduleModel.find({
      status: { $in: ["approved", "modified"]},
      'sessions.specialistId': doctorId
    }).populate({
      path: 'guardianId',
      select: 'name _id childStatus'
    }).lean();

 
    const departmentIds = [];
    for (const { sessions } of guardianSchedules) {
      for (const session of sessions) {
        if (String(session.specialistId) === String(doctorId)) {
          departmentIds.push(session.department);
        }
      }
    }

    const departments = await DepartmentModel.find({ _id: { $in: departmentIds } }).select('name');
    const departmentsMap = {};
    for (const dept of departments) {
      departmentsMap[dept._id.toString()] = dept;
    }
    const bookedSessionsMap = {};

    for (const { sessions, guardianId } of guardianSchedules) {
      for (const session of sessions) {
        const { _id: sessionId, specialistId, dayOfWeek, time, department } = session;
        if (String(specialistId) !== String(doctorId)) continue;

        bookedSessionsMap[dayOfWeek] ??= {};
        bookedSessionsMap[dayOfWeek][time] = {
          status: 'Booked',
          sessionId,
          guardian: guardianId
              ? {
            _id: guardianId._id,
            name: guardianId.name,
            childStatus: guardianId.childStatus,
           department: departmentsMap[department?.toString()] || null
    }
  : null

        };
      }
    }

    const scheduleDetails = [];

    const addDaySchedule = (dayOfWeek, details, baseTimes = []) => {
      const bookedForDay = bookedSessionsMap[dayOfWeek] || {};
      const mergedTimes = [...new Set([...baseTimes, ...Object.keys(bookedForDay)])].sort((a, b) => {
        const toMinutes = (t) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };
        return toMinutes(a) - toMinutes(b);
      });

      const times = mergedTimes.map((time) => ({
        time,
        status: bookedForDay[time]?.status || 'Available',
        sessionId: bookedForDay[time]?.sessionId || null,
        guardian: bookedForDay[time]?.guardian || null
      }));

      scheduleDetails.push({ dayOfWeek, details, times });
    };

    for (const { dayOfWeek, times, details } of doctorSchedule.availableSlots) {
      addDaySchedule(dayOfWeek, details, times);
    }


    for (const day in bookedSessionsMap) {
      if (!scheduleDetails.some((d) => d.dayOfWeek === day)) {
        addDaySchedule(day, 'Reconstructed from expected slots');
      }
    }

    return res.status(200).json({ doctorId, schedule: scheduleDetails });

  } catch (error) {
    console.error("Error displaying the doctor's schedule:", error);
    return res.status(500).json({ message: "An error occurred while displaying the schedule." });
  }
};


export const showAll=async(req,res)=>{
    try{
        const findALL=await DoctorScheduleModel.find({});
        if(!findALL){
            return res.status(404).json({message:"not found"})
        }else{
            return res.status(200).json({message:"all ",findALL})
        }

    }catch(error){
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}





export const ShowById=async(req,res)=>{
    try{
        const {doctorId}=req.params;
        const find=await DoctorScheduleModel.findOne({doctor:doctorId})
        if(!find){
            return res.status(404).json({message:"not found"});
        }else{
            return res.status(200).json({message:"all",find})
        }

    }catch(error){
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}




export const deleteSpecificTime = async (req, res) => {
    try {
      const { doctorId, dayOfWeek, time } = req.params;
  
      const doctorSchedule = await DoctorScheduleModel.findOne({ doctor: doctorId });
  
      if (!doctorSchedule) {
        return res.status(404).json({ message: "Schedule not found for this doctor" });
      }
  
     
      const daySlot = doctorSchedule.availableSlots.find(slot => slot.dayOfWeek === dayOfWeek);
  
      if (!daySlot) {
        return res.status(404).json({ message: `No slots found for ${dayOfWeek}` });
      }
  
     
      daySlot.times = daySlot.times.filter(t => t !== time);
  
      
      await doctorSchedule.save();
  
      return res.status(200).json({ message: `Time ${time} on ${dayOfWeek} deleted successfully`, updatedSchedule: doctorSchedule });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };




  export const updateSpecificTime = async (req, res) => {
    try {
      const { doctorId, dayOfWeek, oldTime} = req.params;
      const { newTime ,details}=req.body;
  
      const doctorSchedule = await DoctorScheduleModel.findOne({ doctor: doctorId });
  
      if (!doctorSchedule) {
        return res.status(404).json({ message: "Schedule not found for this doctor" });
      }
  
     
      const daySlot = doctorSchedule.availableSlots.find(slot => slot.dayOfWeek === dayOfWeek);
  
      if (!daySlot) {
        return res.status(404).json({ message: `No slots found for ${dayOfWeek}` });
      }
  
      
      const timeIndex = daySlot.times.indexOf(oldTime);
  
      if (timeIndex === -1) {
        return res.status(404).json({ message: `Time ${oldTime} not found on ${dayOfWeek}` });
      }
  
     
      daySlot.times[timeIndex] = newTime;
      doctorSchedule.details=details;
  
      
      await doctorSchedule.save();
  
      return res.status(200).json({ message: `Time updated successfully`, updatedSchedule: doctorSchedule });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  





  export const addSchedulee = async (req, res) => {
    try {
      const ManegerId = req.user._id;//admin
      const { doctorId } = req.params;
  
      const doctor = await userModel.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
  
      const existingSchedule = await DoctorScheduleModel.findOne({ doctor: doctorId });
      if (existingSchedule) {
        return res.status(400).json({ message: "Schedule already exists for this doctor" });
      }
  
     
      const generateSchedule = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        const slots = [];
  
        for (const day of days) {
          const dayTimes = [];
          for (let hour = 9; hour < 15; hour++) {
            if (hour === 12) continue; // استراحة الساعة 12
            dayTimes.push(`${hour.toString().padStart(2, '0')}:00`);
            dayTimes.push(`${hour.toString().padStart(2, '0')}:30`);
          }
  
          slots.push({
            dayOfWeek: day,
            times: dayTimes,
            details: 'جدول تلقائي من 9 إلى 3 مع استراحة 12'
          });
        }
  
        return slots;
      };
  
      const availableSlots = generateSchedule();
  
      const newSchedule = await DoctorScheduleModel.create({
        doctor: doctorId,
        ManegerId,
        availableSlots
      });
  
      return res.status(201).json({ message: "Schedule created successfully", schedule: newSchedule });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

//////////////////////////////////////////////////////////////////


  export const deleteDoctorSchedule = async (req, res) => {
    try {
      const { doctorId } = req.params;
      
    
      const doctorSchedule = await DoctorScheduleModel.findOne({ doctor: doctorId });
  
      if (!doctorSchedule) {
        return res.status(404).json({ message: "Doctor's schedule not found" });
      }
  
      await DoctorScheduleModel.deleteOne({ doctor: doctorId });
  
      await GuardianScheduleModel.updateMany(
        { 'sessions.specialistId': doctorId },
        { $pull: { sessions: { specialistId: doctorId } } }
      );
  
      return res.status(200).json({ message: "Doctor's schedule deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

///////////////////////////////////////////////////////////


export const fixLostAvailableSlots = async () => {
  try {
    const expectedSlots = {
      Sunday:    ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30'],
      Monday:    ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30'],
      Tuesday:   ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30'],
      Wednesday: ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30'],
      Thursday:  ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30'],
    };

    const allDoctors = await DoctorScheduleModel.find({}).populate('doctor');

    for (const doc of allDoctors) {
      const doctorId = doc.doctor._id.toString();

      const guardianSchedules = await GuardianScheduleModel.find({ 'sessions.specialistId': doctorId });

      const bookedSlots = [];
      guardianSchedules.forEach(schedule => {
        schedule.sessions.forEach(session => {
          if (
            session.specialistId?.toString() === doctorId &&
            session.dayOfWeek &&
            session.time
          ) {
            bookedSlots.push({ day: session.dayOfWeek, time: session.time });
          }
        });
      });

      const bookedSet = new Set(bookedSlots.map(s => `${s.day}_${s.time}`));

  
      const newAvailableSlots = [];

      for (const [day, times] of Object.entries(expectedSlots)) {
        const availableTimes = times.filter(time => !bookedSet.has(`${day}_${time}`));
        newAvailableSlots.push({
          dayOfWeek: day,
          times: availableTimes,
          details: 'Reconstructed from expected slots'
        });
      }

      doc.availableSlots = newAvailableSlots;
      await doc.save();
      console.log(`✅ Schedule rebuilt for doctor ${doctorId}`);
    }

    console.log("🎯 All doctors' schedules rebuilt based on expected slots and booked sessions.");
  } catch (err) {
    console.error("❌ Error during slot fixing:", err.message);
  }
};
