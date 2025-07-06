
import GuardianScheduleModel  from '../../../../DB/models/GuardianSchedule.model.js';
import DoctorScheduleModel  from '../../../../DB/models/DoctorSchedule.model.js';
import { DepartmentModel } from "../../../../DB/models/department.model.js";
import { userModel } from "../../../../DB/models/user.model.js";


export const submitGuardianScheduleRequest = async (req, res) => {
    try {
      const guardianId = req.user._id;
      const { sessions } = req.body;
  
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
        return res.status(400).json({ message: "Sessions are required" });
      }
  
      const existingRequest = await GuardianScheduleModel.findOne({
        guardianId: guardianId,
        "sessions.department": { $in: sessions.map(s => s.department) }
      });
  
      if (existingRequest) {
        return res.status(400).json({ message: "You already submitted a schedule request including one or more of these departments." });
      }
  
      const request = await GuardianScheduleModel.create({
        guardianId,
        sessions
      });
  
      return res.status(201).json({ message: "Schedule request submitted successfully", request });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  

  export const getPendingScheduleRequests = async (req, res) => {
    try {
      const pendingRequests = await GuardianScheduleModel.find({ status: "pending" })
        .populate('guardianId', 'name')
        .populate('sessions.department', 'name')
        .populate('sessions.specialistId', 'name');
  
      if (!pendingRequests || pendingRequests.length === 0) {
        return res.status(404).json({ message: "No pending schedule requests found." });
      }
  
      return res.status(200).json({ message: "Pending schedule requests fetched successfully", pendingRequests });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  


 
  export const getModifingScheduleRequests = async (req, res) => {
    try {
      const modifiedRequests = await GuardianScheduleModel.find({ status: "modified" })
        .populate('guardianId', 'name')
        .populate('sessions.department', 'name')
        .populate('sessions.specialistId', 'name');
  
      if (!modifiedRequests || modifiedRequests.length === 0) {
        return res.status(404).json({ message: "No modified schedule requests found." });
      }
  
      return res.status(200).json({ message: "modified schedule requests fetched successfully", modifiedRequests });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
 


  export const approveGuardianScheduleRequest = async (req, res) => {
    try {
      const managerId = req.user._id;
      const { requestId } = req.params;
      const { sessions } = req.body; 
  
      const request = await GuardianScheduleModel.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
  
  
      for (const session of sessions) {
        const { doctor, day, time } = session;
  
        const doctorSchedule = await DoctorScheduleModel.findOne({ doctor });
        if (!doctorSchedule) {
          return res.status(404).json({ message: `Schedule not found for doctor ${doctor}` });
        }
  
        const daySlot = doctorSchedule.availableSlots.find(slot => slot.dayOfWeek === day);
        if (!daySlot || !daySlot.times.includes(time)) {
          return res.status(400).json({ message: `Time ${time} on ${day} is not available for doctor ${doctor}` });
        }
  
    
        daySlot.times = daySlot.times.filter(t => t !== time);
        await doctorSchedule.save();
      }
  
      request.sessions = sessions.map(session => ({
        department: session.department,
        specialistId: session.doctor,
        dayOfWeek: session.day,
        time: session.time
      }));
  
      request.status = "approved";
      request.manager = managerId;
  
      await request.save();
  
      return res.status(200).json({ message: "All sessions approved successfully", updatedRequest: request });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

  export const getApprovedScheduleForGuardian = async (req, res) => {
    try {
      const guardianId = req.params.id;  
  
      const approvedRequests = await GuardianScheduleModel.find({
        guardianId,
        status: { $in: ["approved", "modified"] }
      })
      .populate('guardianId', 'name')
      .populate('sessions.department', 'name')
      .populate('sessions.specialistId', 'name');
  
      if (!approvedRequests || approvedRequests.length === 0) {
        return res.status(404).json({ message: "No approved schedule found." });
      }
  
      return res.status(200).json({
        message: "Approved schedule retrieved successfully.",
        guardianRequests: approvedRequests
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };
  


  export const requestModifySession = async (req, res) => {
    try {
      const { requestId, sessionId } = req.params;
      const { newDay, newTime } = req.body;
  
      const schedule = await GuardianScheduleModel.findById(requestId);
      if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  
      const session = schedule.sessions.id(sessionId);
      if (!session) return res.status(404).json({ message: "Session not found" });
  
  
      if (session.dayOfWeek === newDay && session.time === newTime) {
        return res.status(400).json({ message: "New time is same as current time." });
      }
  
      const doctorSchedule = await DoctorScheduleModel.findOne({ doctor: session.specialistId });
      if (!doctorSchedule) return res.status(404).json({ message: "Doctor schedule not found." });
  
      const daySlot = doctorSchedule.availableSlots.find(slot => slot.dayOfWeek === newDay);
      if (!daySlot || !daySlot.times.includes(newTime)) {
        return res.status(400).json({ message: "Selected time is not available for the doctor." });
      }
  
      
      const hasConflictInSameRequest = schedule.sessions.some(s => {
        if (s._id.equals(sessionId)) return false; 
        const currentTimeConflict = s.dayOfWeek === newDay && s.time === newTime;
        const newTimeConflict = s.newDay === newDay && s.newTime === newTime;
        return currentTimeConflict || newTimeConflict;
      });
  
      if (hasConflictInSameRequest) {
        return res.status(400).json({ message: "Time conflicts with another session in the same request." });
      }

      const guardianId = schedule.guardianId.toString();
      const allGuardianRequests = await GuardianScheduleModel.find({
        guardianId,
        status: { $in: ["approved", "modified"] },
        _id: { $ne: requestId }
      });
  
      for (const req of allGuardianRequests) {
        for (const s of req.sessions) {
          if ((s.dayOfWeek === newDay && s.time === newTime) ||
              (s.newDay === newDay && s.newTime === newTime)) {
            return res.status(400).json({ message: "Time conflicts with another session." });
          }
        }
      }
  
   
      session.newDay = newDay;
      session.newTime = newTime;
      schedule.status = 'modified';
  
      await schedule.save();
      return res.status(200).json({ message: "Modification request sent to manager" });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  


export const approveModifiedSession = async (req, res) => {
  try {
    const { requestId, sessionId } = req.params;
    const scheduleRequest = await GuardianScheduleModel.findById(requestId);

    if (!scheduleRequest) {
      return res.status(404).json({ message: "Schedule request not found" });
    }

    const session = scheduleRequest.sessions.find(s => s._id.toString() === sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const doctorSchedule = await DoctorScheduleModel.findOne({ doctor: session.specialistId });
    if (!doctorSchedule) {
      return res.status(404).json({ message: "Doctor's schedule not found" });
    }

    const newDay = session.newDay;
    const newTime = session.newTime;
    const daySlot = doctorSchedule.availableSlots.find(slot => slot.dayOfWeek === newDay);
    if (!daySlot || !daySlot.times.includes(newTime)) {
      return res.status(400).json({ message: "Selected time is not available" });
    }

    const doctorConflict = await GuardianScheduleModel.findOne({
      sessions: {
        $elemMatch: {
          specialistId: session.specialistId,
          dayOfWeek: newDay,
          time: newTime,
          _id: { $ne: session._id }
        }
      },
      status: { $in: ["approved", "modified"] }
    });
    

    if (doctorConflict) {
      return res.status(400).json({ message: "This time slot is already booked for the doctor." });
    }

    const childConflict = await GuardianScheduleModel.findOne({
      sessions: {
        $elemMatch: {
          childId: session.childId,
          dayOfWeek: newDay,
          time: newTime,
          _id: { $ne: session._id }
        }
      },
      status: { $in: ["approved", "modified"] }
    });
    

    if (childConflict) {
      return res.status(400).json({ message: "This child already has a session at that time." });
    }

   
    daySlot.times = daySlot.times.filter(t => t !== newTime);
    await doctorSchedule.save();


    session.dayOfWeek = newDay;
    session.time = newTime;
    session.newDay = undefined;
    session.newTime = undefined;

   
    scheduleRequest.status = "approved";

    scheduleRequest.markModified("sessions");
    await scheduleRequest.save();

    return res.status(200).json({ message: "Session approved and schedule status updated." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};




export const rejectModifiedSession = async (req, res) => {
  try {
    const { requestId, sessionId } = req.params;

    const scheduleRequest = await GuardianScheduleModel.findById(requestId);

    if (!scheduleRequest) {
      return res.status(404).json({ message: "Schedule request not found" });
    }

    const session = scheduleRequest.sessions.find(s => s._id.toString() === sessionId);
    if (!session) {
      console.log("Available sessions:", scheduleRequest.sessions.map(s => s._id.toString()));
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.newDay || !session.newTime) {
      return res.status(400).json({ message: "This session is not marked as modified." });
    }

    
    session.newDay = undefined;
    session.newTime = undefined;
    session.status = "approved";

    const anyModifiedSessions = scheduleRequest.sessions.some(
      s => s.newDay && s.newTime
    );

    scheduleRequest.status = anyModifiedSessions ? "modified" : "approved";

    scheduleRequest.markModified("sessions");
    await scheduleRequest.save();

    return res.status(200).json({ message: "Modification rejected and original session restored" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getGuardianScheduleStatus = async (req, res) => {
  try {
    const guardianId = req.user._id;
    const request = await GuardianScheduleModel.findOne({ guardianId }).sort({ createdAt: -1 });

    if (!request) {
      return res.status(404).json({ message: "No schedule request found." });
    }

    return res.status(200).json({
      status: request.status,  
      message: "Request found"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




export const getDoctorsForGuardian = async (req, res) => {
  try {
    const guardianIdFromUrl = req.params.guardianId ;
    const guardianId = guardianIdFromUrl || req.user._id;

    const schedules = await GuardianScheduleModel.find({
      guardianId,
      status: { $in: ["approved", "modified"] }
    }).populate('sessions.specialistId', 'name email image');

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ message: "No doctors found for this guardian." });
    }

    let doctorsSet = new Set();
    schedules.forEach(schedule => {
      schedule.sessions.forEach(session => {
        if (session.specialistId) {
          doctorsSet.add(session.specialistId._id.toString());
        }
      });
    });

    const doctorIds = Array.from(doctorsSet);

    const doctors = await userModel.find(
      { _id: { $in: doctorIds } },
      'name email image'
    );

    return res.status(200).json({ message: "Doctors found", doctors });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




export const getGuardiansForDoctor = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const schedules = await GuardianScheduleModel.find({
      status: { $in: ["approved", "modified"] },
      "sessions.specialistId": doctorId
    }).populate('guardianId', 'name email image');

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ message: "No guardians found for this doctor." });
    }

   
    let guardiansSet = new Set();
    schedules.forEach(schedule => {
      if (schedule.guardianId) {
        guardiansSet.add(schedule.guardianId._id.toString());
      }
    });

    const guardianIds = Array.from(guardiansSet);

    const guardians = await userModel.find(
      { _id: { $in: guardianIds } },
      'name email image'
    );

    return res.status(200).json({ message: "Guardians found", guardians });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




export const addGuardianSession = async (req, res) => {
  try {
    const { guardianId, department, specialistId, dayOfWeek, time } = req.body;

    if (!guardianId || !department || !specialistId || !dayOfWeek || !time) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // تحقق من جدول الطبيب إذا الوقت متاح
    const doctorSchedule = await DoctorScheduleModel.findOne({ doctor: specialistId });
    if (!doctorSchedule) {
      return res.status(404).json({ message: "Doctor's schedule not found." });
    }

    const daySlot = doctorSchedule.availableSlots.find(slot => slot.dayOfWeek === dayOfWeek);
    if (!daySlot || !daySlot.times.includes(time)) {
      return res.status(400).json({ message: "Time is not available for the doctor." });
    }

    // تحقق إذا الجاردين عنده جلسة بنفس اليوم والوقت
    const duplicateTime = await GuardianScheduleModel.findOne({
      guardianId,
      status: { $in: ['approved', 'pending', 'modified'] },
      sessions: {
        $elemMatch: {
          dayOfWeek,
          time
        }
      }
    });

    if (duplicateTime) {
      return res.status(400).json({ message: "Guardian already has a session at this time." });
    }

    // تحقق من وجود جلسة بنفس القسم مع دكتور مختلف
    const conflictInDepartment = await GuardianScheduleModel.findOne({
      guardianId,
      status: { $in: ['approved', 'pending', 'modified'] },
      sessions: {
        $elemMatch: {
          department,
          specialistId: { $ne: specialistId }
        }
      }
    });

    if (conflictInDepartment) {
      return res.status(400).json({
        message: "Guardian already has a session in this department with a different doctor."
      });
    }

    const newSession = {
      department,
      specialistId,
      dayOfWeek,
      time
    };

    // ابحث عن أي طلب سابق للجاردين (نعدل عليه بدل ما ننشئ جديد)
    let existingRequest = await GuardianScheduleModel.findOne({ guardianId }).sort({ createdAt: -1 });

    if (existingRequest) {
      // تحقق إذا الجلسة مكررة داخل نفس الطلب
      const isDuplicateInRequest = existingRequest.sessions.some(session =>
        session.dayOfWeek === dayOfWeek &&
        session.time === time &&
        session.department.toString() === department &&
        session.specialistId.toString() === specialistId
      );

      if (isDuplicateInRequest) {
        return res.status(400).json({ message: "Session already exists in the request." });
      }

      existingRequest.sessions.push(newSession);
      existingRequest.status = 'approved'; // حدث الحالة إلى approved
      await existingRequest.save();

      // حذف الوقت من جدول الطبيب
      daySlot.times = daySlot.times.filter(t => t !== time);
      await doctorSchedule.save();

      return res.status(200).json({
        message: "Session added to existing request and approved",
        request: existingRequest
      });
    }

    // لا يوجد طلب قديم، أنشئ طلب جديد
    const newRequest = await GuardianScheduleModel.create({
      guardianId,
      sessions: [newSession],
      status: 'approved'
    });

    // حذف الوقت من جدول الطبيب
    daySlot.times = daySlot.times.filter(t => t !== time);
    await doctorSchedule.save();

    return res.status(201).json({
      message: "New schedule request created and approved",
      request: newRequest
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};




export const deleteGuardianSession = async (req, res) => {
  try {
    const { requestId, sessionId } = req.body;

    if (!requestId || !sessionId) {
      return res.status(400).json({ message: "Request ID and Session ID are required." });
    }

    const request = await GuardianScheduleModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Schedule request not found." });
    }

    const originalLength = request.sessions.length;
    request.sessions = request.sessions.filter(session => session._id.toString() !== sessionId);

    if (request.sessions.length === originalLength) {
      return res.status(404).json({ message: "Session not found in the request." });
    }


    await request.save();

    return res.status(200).json({ message: "Session deleted successfully.", request });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};




export const updateGuardianSession = async (req, res) => {
  try {
    const { requestId, sessionId, newDayOfWeek, newTime } = req.body;

    if (!requestId || !sessionId || !newDayOfWeek || !newTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const request = await GuardianScheduleModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Schedule request not found." });
    }

    const session = request.sessions.id(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found in the request." });
    }

    const specialistId = session.specialistId;
    const doctorSchedule = await DoctorScheduleModel.findOne({ doctor: specialistId });
    if (!doctorSchedule) {
      return res.status(404).json({ message: "Doctor's schedule not found." });
    }

    const daySlot = doctorSchedule.availableSlots.find(slot => slot.dayOfWeek === newDayOfWeek);
    if (!daySlot || !daySlot.times.includes(newTime)) {
      return res.status(400).json({ message: "The new time is not available for the doctor." });
    }

    const conflictingSession = await GuardianScheduleModel.findOne({
      guardianId: request.guardianId,
      status: { $in: ['approved', 'pending', 'modified'] },
      "sessions": {
        $elemMatch: {
          dayOfWeek: newDayOfWeek,
          time: newTime,
          _id: { $ne: sessionId }
        }
      }
    });

    if (conflictingSession) {
      return res.status(400).json({ message: "Guardian already has another session at this new time." });
    }


    session.dayOfWeek = newDayOfWeek;
    session.time = newTime;

    await request.save();

    return res.status(200).json({ message: "Session updated successfully.", request });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};




export const getGuardianSchedule = async (req, res) => {
  try {
    const guardianId = req.params.id;

    const schedule = await GuardianScheduleModel.findOne({ guardianId })
      .populate("guardianId", "name email image")
      .populate("sessions.department", "name")
      .populate("sessions.specialistId", "name email");

    if (!schedule) {
      return res.status(404).json({ message: "No schedule found for this guardian." });
    }

    return res.status(200).json({
      message: "Schedule retrieved successfully",
      guardian: schedule.guardianId,
      sessions: schedule.sessions,
    });
  } catch (error) {
    console.error("Error fetching guardian schedule:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllGuardianScheduleRequests = async (req, res) => {
  try {
    const requests = await GuardianScheduleModel.find({
      status: { $in: ['pending', 'modified'] }
    })
      .populate('guardianId', 'name')
      .populate('sessions.department', 'name')
      .populate('sessions.specialistId', 'name');

    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: "No schedule requests found." });
    }

    return res.status(200).json({
      message: "Pending and modified schedule requests fetched successfully",
      requests
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

