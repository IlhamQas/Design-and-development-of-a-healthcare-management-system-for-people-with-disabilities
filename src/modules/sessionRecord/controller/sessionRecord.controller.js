import { SessionRecordModel } from '../../../../DB/models/sessionRecord.model.js';  
import GuardianScheduleModel from '../../../../DB/models/GuardianSchedule.model.js';
import cloudenary from '../../../Servicess/cloudenary.js';


export const addSessionNote = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { sessionId, note, rating, sessionDate, guardianId } = req.body;

    if (!note || note.trim() === "") {
      return res.status(400).json({ message: "يجب إدخال نوت نصية على الأقل" });
    }

    const normalizedDate = new Date(sessionDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const existingNote = await SessionRecordModel.findOne({
      sessionId,
      doctorId,
      sessionDate: {
        $gte: normalizedDate,
        $lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingNote) {
      return res.status(400).json({ message: "Note already exists for this session." });
    }

    
    let mediaUrl = null;
    if (req.file) {
      const result = await cloudenary.uploader.upload(req.file.path, {
        folder: "session_notes/",
        resource_type: "auto",
      });
      mediaUrl = result.secure_url;
    }

    const newNote = await SessionRecordModel.create({
      sessionId,
      guardianId,
      doctorId,
      note,
      rating,
      sessionDate: new Date(sessionDate),
      media: mediaUrl
    });

    return res.status(201).json({ message: "Note added successfully", newNote });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getDoctorNotes = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const notes = await SessionRecordModel.find({ doctorId })
      .populate('guardianId', 'name' )
      .sort({ sessionDate: -1 });

    return res.status(200).json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getGuardianNotes = async (req, res) => {
  try {
    const guardianId = req.user._id;


    const notes = await SessionRecordModel.find({ guardianId })
      .populate('doctorId', 'name')
      .sort({ sessionDate: -1 });
    const guardianSchedules = await GuardianScheduleModel.find({ guardianId })
      .populate('sessions.department', 'name');


    const notesWithDepartments = notes.map(note => {
      let departmentName = 'N/A';

      for (const schedule of guardianSchedules) {
        const foundSession = schedule.sessions.find(session => 
          session._id.toString() === note.sessionId.toString()
        );
        if (foundSession) {
          departmentName = foundSession.department?.name || 'N/A';
          break;
        }
      }

      return {
        ...note.toObject(),
        departmentName
      };
    });

    return res.status(200).json({ notes: notesWithDepartments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getNotesByGuardian = async (req, res) => {
    try {
      const doctorId = req.user._id;
      const guardianId = req.params.guardianId;
  
      const notes = await SessionRecordModel.find({ doctorId, guardianId })
        .populate('guardianId', 'name')
        .sort({ sessionDate: -1 });
  
      return res.status(200).json({ notes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

  
  export const updateSessionNote = async (req, res) => {
    try {
      const doctorId = req.user._id;
      const noteId = req.params.noteId
      const { note, rating } = req.body; 
      const updateData = {};
  
      if (note !== undefined) updateData.note = note;
      if (rating !== undefined) updateData.rating = rating;
  
      if (req.file) {
        const result = await cloudenary.uploader.upload(req.file.path, {
          folder: "session_notes/",
          resource_type: "auto",
        });
        updateData.media = result.secure_url;
      }
      const noteS = await SessionRecordModel.findById(noteId);
      console.log("NOTE ID"+noteId);

      const updatedNote = await SessionRecordModel.findOneAndUpdate(
        { _id: noteId ,doctorId},
        updateData,
        { new: true }
      );
  
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found or unauthorized" });
      }
  
      return res.status(200).json({ message: "Note updated successfully", updatedNote });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  
  


export const deleteSessionNote = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { noteId } = req.params;

    const deletedNote = await SessionRecordModel.findOneAndDelete({ _id: noteId, doctorId });

    if (!deletedNote) return res.status(404).json({ message: "Note not found or unauthorized" });

    return res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getSessionImprovement = async (req, res) => {
  try {
    const guardianId = req.user._id;

    const guardianSchedule = await GuardianScheduleModel.find({ guardianId })
      .populate('sessions.specialistId', 'name')
      .populate('sessions.department', 'name');

    if (!guardianSchedule || guardianSchedule.length === 0) {
      return res.status(404).json({ message: "No sessions found for this guardian." });
    }

    
    const allSessions = guardianSchedule.flatMap(schedule => schedule.sessions);
    const sessionIds = allSessions.map(session => session._id);


    const sessionRecords = await SessionRecordModel.find({
      sessionId: { $in: sessionIds }
    }).populate('doctorId', 'name');


    const recordsMap = new Map();
    for (const record of sessionRecords) {
      const sessionId = record.sessionId.toString();
      if (!recordsMap.has(sessionId)) {
        recordsMap.set(sessionId, []);
      }
      recordsMap.get(sessionId).push({
        date: record.sessionDate,
        improvementLevel: record.rating,
        note: record.note,
        doctorName: record.doctorId?.name || "Unknown"
      });
    }


    const sessionsWithImprovement = allSessions.map(session => ({
      department: session.department?.name || "N/A",
      specialist: session.specialistId?.name || "N/A",
      sessionDate: session.date,
      improvements: recordsMap.get(session._id.toString()) || []
    }));

    return res.status(200).json({
      message: "Sessions with improvement data fetched successfully.",
      sessionsWithImprovement
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};



export const getSessionImprovementdoctor = async (req, res) => {
  try {
    const doctorId = req.user._id; 
    const guardianId = req.params.guardianId || req.query.guardianId;

    if (!guardianId) {
      return res.status(400).json({ message: "يجب تزويد guardianId." });
    }

   
    const guardianSchedules = await GuardianScheduleModel.find({ guardianId })
      .populate('sessions.department', 'name icon') 
      .populate('sessions.specialistId', 'name profileImage'); 

    if (!guardianSchedules || guardianSchedules.length === 0) {
      return res.status(404).json({ message: "لا توجد جلسات لهذا الولي." });
    }

   
    const relevantSessions = guardianSchedules.flatMap(schedule =>
      schedule.sessions
        .filter(session => session.specialistId?._id?.toString() === doctorId.toString())
        .map(session => ({
          sessionId: session._id,
          department: {
            id: session.department?._id || null,
            name: session.department?.name || "غير معروف",
            icon: session.department?.icon || null
          },
          specialist: {
            id: session.specialistId?._id || null,
            name: session.specialistId?.name || "غير معروف",
            profileImage: session.specialistId?.profileImage || null
          },
          sessionDate: session.dayOfWeek + " " + session.time
        }))
    );

    if (relevantSessions.length === 0) {
      return res.status(403).json({ message: "ليس لديك صلاحية للاطلاع على جلسات هذا الطفل." });
    }

    const sessionIds = relevantSessions.map(s => s.sessionId);

    const sessionRecords = await SessionRecordModel.find({
      sessionId: { $in: sessionIds },
      doctorId: doctorId
    }).populate('doctorId', 'name profileImage');

    const recordsMap = new Map();
    for (const record of sessionRecords) {
      const sId = record.sessionId.toString();
      if (!recordsMap.has(sId)) {
        recordsMap.set(sId, []);
      }
      recordsMap.get(sId).push({
        date: record.sessionDate,
        improvementLevel: record.rating,
        note: record.note,
        doctorName: record.doctorId?.name || "غير معروف",
        doctorImage: record.doctorId?.profileImage || null,
        media: record.media || null
      });
    }

    const sessionsWithImprovement = relevantSessions.map(session => ({
      sessionId: session.sessionId,
      department: session.department,
      specialist: session.specialist,
      sessionDate: session.sessionDate,
      improvements: recordsMap.get(session.sessionId.toString()) || []
    }));

    return res.status(200).json({
      message: "تم جلب بيانات التحسن بنجاح.",
      sessionsWithImprovement
    });

  } catch (error) {
    console.error("Error fetching session improvements:", error);
    return res.status(500).json({ message: "حدث خطأ في الخادم." });
  }
};

export const getAllImprovementLevels = async (req, res) => {
  try {
    const guardianSchedules = await GuardianScheduleModel.find()
      .populate('guardianId', 'name')
      .populate('sessions.department', 'name') 
      .populate('sessions.specialistId', 'name profileImage'); 

    if (!guardianSchedules || guardianSchedules.length === 0) {
      return res.status(404).json({ message: "لا توجد جلسات مسجلة." });
    }

  
    const allSessions = guardianSchedules.flatMap(schedule =>
      schedule.sessions.map(session => ({
        sessionId: session._id,
        guardian: {
          id: schedule.guardianId?._id, 
          name: schedule.guardianId?.name || "غير معروف"
        },
        department: session.department?.name || "غير معروف",
        specialist: {
          id: session.specialistId?._id || null,
          name: session.specialistId?.name || "غير معروف",
          profileImage: session.specialistId?.profileImage || null
        },
        sessionDate: session.dayOfWeek + " " + session.time
      }))
    );

  
    const sessionIds = allSessions.map(s => s.sessionId);
    const sessionRecords = await SessionRecordModel.find({
      sessionId: { $in: sessionIds }
    }).populate('doctorId', 'name profileImage');

   
    const recordsMap = new Map();
    for (const record of sessionRecords) {
      const sId = record.sessionId.toString();
      if (!recordsMap.has(sId)) {
        recordsMap.set(sId, []);
      }
      recordsMap.get(sId).push({
        date: record.sessionDate,
        improvementLevel: record.rating,
        note: record.note,
        doctorName: record.doctorId?.name || "غير معروف",
        doctorImage: record.doctorId?.profileImage || null,
        media: record.media || null
      });
    }
    const sessionsWithImprovements = allSessions.map(session => ({
      sessionId: session.sessionId,
      guardian: session.guardian,
      department: session.department,
      specialist: session.specialist,
      sessionDate: session.sessionDate,
      improvements: recordsMap.get(session.sessionId.toString()) || []
    }));

  
    return res.status(200).json({
      message: "تم جلب كل مستويات التحسن بنجاح.",
      sessionsWithImprovements
    });

  } catch (error) {
    console.error("Error fetching all improvements:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء معالجة البيانات." });
  }
};





export const getImprovementLevelsForDoctorChildren = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const guardianSchedules = await GuardianScheduleModel.find({
      "sessions.specialistId": doctorId
    })
      .populate('guardianId', 'name')
      .populate('sessions.department', 'name')
      .populate('sessions.specialistId', 'name profileImage');

    if (!guardianSchedules || guardianSchedules.length === 0) {
      return res.status(404).json({ message: "لا توجد جلسات مرتبطة بك." });
    }


    const relevantSessions = guardianSchedules.flatMap(schedule =>
      schedule.sessions
        .filter(session => session.specialistId?._id?.toString() === doctorId.toString())
        .map(session => ({
          sessionId: session._id,
          guardian: {
            id: schedule.guardianId?._id,
            name: schedule.guardianId?.name || "غير معروف"
          },
          department: session.department?.name || "غير معروف",
          specialist: {
            id: session.specialistId?._id || null,
            name: session.specialistId?.name || "غير معروف",
            profileImage: session.specialistId?.profileImage || null
          },
          sessionDate: session.dayOfWeek + " " + session.time
        }))
    );

    if (relevantSessions.length === 0) {
      return res.status(200).json({ message: "لا توجد جلسات مسجلة باسمك.", sessionsWithImprovements: [] });
    }

    const sessionIds = relevantSessions.map(s => s.sessionId);

 
    const sessionRecords = await SessionRecordModel.find({
      sessionId: { $in: sessionIds },
      doctorId: doctorId
    }).populate('doctorId', 'name profileImage');


    const recordsMap = new Map();
    for (const record of sessionRecords) {
      const sId = record.sessionId.toString();
      if (!recordsMap.has(sId)) {
        recordsMap.set(sId, []);
      }
      recordsMap.get(sId).push({
        date: record.sessionDate,
        improvementLevel: record.rating,
        note: record.note,
        doctorName: record.doctorId?.name || "غير معروف",
        doctorImage: record.doctorId?.profileImage || null,
        media: record.media || null
      });
    }

    const sessionsWithImprovements = relevantSessions.map(session => ({
      sessionId: session.sessionId,
      guardian: session.guardian,
      department: session.department,
      specialist: session.specialist,
      sessionDate: session.sessionDate,
      improvements: recordsMap.get(session.sessionId.toString()) || []
    }));

    return res.status(200).json({
      message: "تم جلب مستويات التحسن لكل الأطفال المرتبطين بك.",
      sessionsWithImprovements
    });

  } catch (error) {
    console.error("Error fetching doctor improvement levels:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء معالجة البيانات." });
  }
};
