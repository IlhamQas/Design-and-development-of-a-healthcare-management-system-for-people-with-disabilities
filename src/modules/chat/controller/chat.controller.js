import { chatModel } from "../../../../DB/models/chat.model.js";
import cloudenary from "../../../Servicess/cloudenary.js";  // رابط خدمة Cloudinary
import { io, onlineUsers } from "../../../../index.js";
import { userModel } from '../../../../DB/models/user.model.js';

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;  
    const { receiverId, message } = req.body;

    if ((!message || message.trim() === "") && !req.file) {
      return res.status(400).json({ message: "Please provide a message or a media file." });
    }

    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      const result = await cloudenary.uploader.upload(req.file.path, {
        folder: "chat_media/",
        resource_type: "auto", 
      });
      mediaUrl = result.secure_url;
      mediaType = result.resource_type;
    }

    const newMessage = await chatModel.create({
      senderId,
      receiverId,
      message,
      mediaUrl,
      mediaType,
    });


    const receiverSocketId = onlineUsers.get(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("privateMessage", {
        senderId,
        message,
        mediaUrl,
        mediaType,
        createdAt: newMessage.createdAt, 
      });
      
    }

    return res.status(201).json({ message: "Message sent successfully", newMessage });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const getMessage = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await chatModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

   
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};




export const getAllUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await chatModel.find({ receiverId: userId }).sort({ createdAt: -1 });
    const senderIds = [...new Set(messages.map(msg => msg.senderId))];
    const senders = await userModel.find({ _id: { $in: senderIds } }).select('name image');

    const messagesWithSenderInfo = messages.map(msg => {
      const sender = senders.find(s => s._id.toString() === msg.senderId);
      return {
        ...msg._doc,
        senderName: sender?.name || 'Unknown',
        senderImage: sender?.image || null
      };
    });

    res.status(200).json({ messages: messagesWithSenderInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};


export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await chatModel.updateMany(
      {
        receiverId: userId,
        readBy: { $ne: userId }
      },
      {
        $push: { readBy: userId }
      }
    );

    res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating messages", error });
  }
};



export const getAllChatToMe = async (req, res) => {
    try {
      const myId = req.user._id;

      const receivedMessages = await chatModel.find({ receiverId: myId });
      const sentMessages = await chatModel.find({ senderId: myId });
  
      const uniqueSenderIds = [...new Set(receivedMessages.map(msg => msg.senderId))].filter(id => id.toString() !== myId.toString());
      const uniqueReceiverIds = [...new Set(sentMessages.map(msg => msg.receiverId))].filter(id => id.toString() !== myId.toString());
  
      const allUserIds = [...new Set([...uniqueSenderIds, ...uniqueReceiverIds])];
      const users = await Promise.all(
        allUserIds.map(async (userId) => {
          const user = await userModel.findById(userId).select('_id name image role');
          const hasUnread = uniqueSenderIds.includes(userId.toString())
            ? await chatModel.exists({
                senderId: userId,
                receiverId: myId,
                readBy: { $ne: myId }
              })
            : false;
  
          return {
            _id: user._id,
            name: user.name,
            image: user.image,
            role: user.role,
            hasUnread: !!hasUnread,
          };
        })
      );
  
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
  };
  

