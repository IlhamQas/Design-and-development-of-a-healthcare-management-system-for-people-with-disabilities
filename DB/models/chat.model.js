import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: false },
  mediaUrl: { type: String, default: null },
  mediaType: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: String, default: [] }]
});

export const chatModel = mongoose.model('Chat', chatSchema);
