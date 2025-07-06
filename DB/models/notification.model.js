
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
  title: { type: String , required: true },
  message: { type: String, required: true },
  receivers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
  roles: [{ type: String }],
  readBy: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
}, {
  timestamps: true,
});

export const NotificationModel = mongoose.model('Notification', notificationSchema);
