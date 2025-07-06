import mongoose from 'mongoose';

const sessionRecordSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'GuardianScheduleModel.sessions' 
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user' 
  },
  guardianId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user' 
  },
  note: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  sessionDate: {
    type: Date,
    default: Date.now
  },
  media: {
    type: String, 
  }
  
}, { timestamps: true });

sessionRecordSchema.index({ sessionId: 1, doctorId: 1, sessionDate: 1 }, { unique: true });

export const SessionRecordModel = mongoose.model('SessionRecord', sessionRecordSchema);
