
import mongoose, { Schema , model } from "mongoose";

const pendingAppointment = new Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  email: {  
    type: String,
    required: true,  
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'] 
  },
  phonenumber: {
    type: Number,
    required: true
  }
});

const pendingAppointmentModel = model('pendingAppointment', pendingAppointment);

export { pendingAppointmentModel };