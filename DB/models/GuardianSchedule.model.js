import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    required: false
  },
  time: {
    type: String,
    required: false
  },
  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false
  },
  newDay: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    required: false,

  },
  newTime: {
    type: String,
    required: false
  },
}, { _id: true });

const guardianScheduleSchema = new mongoose.Schema({
  guardianId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  sessions: {
    type: [sessionSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'modified'],
    default: 'pending'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
}, { timestamps: true });

const GuardianScheduleModel = mongoose.model("GuardianSchedule", guardianScheduleSchema);
export default GuardianScheduleModel;
