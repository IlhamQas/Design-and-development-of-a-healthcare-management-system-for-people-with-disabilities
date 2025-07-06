import mongoose, { Schema, model } from 'mongoose';

const appointmentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {  
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'] 
  },
  phonenumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'cancelled'],
    default: 'approved' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  modifiedRequest: {
    type: Boolean,
    default: false
  },
  modifiedDate: {
    type: Date
  }
});

const appointmentModel = model('appointment', appointmentSchema);
export { appointmentModel };
