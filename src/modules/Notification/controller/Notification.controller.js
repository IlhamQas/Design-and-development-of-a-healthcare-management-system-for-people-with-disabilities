
import { NotificationModel } from "../../../../DB/models/notification.model.js";
import { io, onlineUsers } from "../../../../index.js";
import { userModel } from "../../../../DB/models/user.model.js"; 

export const sendNotification = async (req, res) => {
    try {
      const {title, message, userIds = [], roles = [] } = req.body;
      const senderId = req.user._id;
  
      let receivers = [];
  
   
      if (Array.isArray(userIds) && userIds.length > 0) {
        const validUserIds = userIds.map(id => id.toString());
        receivers.push(...validUserIds);
      }
  
     
      if (Array.isArray(roles) && roles.length > 0) {
        const usersByRole = await userModel.find({ role: { $in: roles } }).select('_id');
        
        if (usersByRole.length > 0) {
          console.log("Users found by roles:", usersByRole);  
        } else {
          console.log("No users found with the given roles:", roles);  
        }
  
        const roleReceivers = usersByRole.map(user => user._id.toString());
        receivers.push(...roleReceivers);
      }
  


    if (roles.includes("all")) {
      const allUsers = await userModel.find({}).select("_id");
      receivers.push(...allUsers.map(user => user._id.toString()));
    } else if (Array.isArray(roles) && roles.length > 0) {
      const usersByRole = await userModel.find({ role: { $in: roles } }).select("_id");
      receivers.push(...usersByRole.map(user => user._id.toString()));
    }


      receivers = [...new Set(receivers)];
  
      if (receivers.length === 0) {
        return res.status(400).json({
          message: "No receivers found for the notification"
        });
      }
  
      
      const notification = await NotificationModel.create({
        senderId,
        title,
        message,
        receivers,
        roles
      });
  
     
      receivers.forEach(receiverId => {
        const socketId = onlineUsers.get(receiverId);
        if (socketId) {
          io.to(socketId).emit("notification", {
            title, 
            message,
            from: senderId,
            notificationId: notification._id
          });
        }
      });
  
      return res.status(201).json({
        message: "Notification sent successfully",
        notification
      });
  
    } catch (error) {
      console.error("Error sending notification:", error);
      return res.status(500).json({
        message: "Failed to send notification",
        error: error.message || error
      });
    }
  };
  


export const getNotifications = async (req, res) => {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;

    let notifications;

    if (userRole === "admin") {
      
      notifications = await NotificationModel.find({
        senderId: userId
      }).sort({ createdAt: -1 });
    } else {
      notifications = await NotificationModel.find({
        receivers: { $in: [userId] }
      }).sort({ createdAt: -1 });
    }
  
      res.status(200).json({ notifications });
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications", error });
    }
  };
  


  export const markNotificationsAsRead = async (req, res) => {
    try {
      const userId = req.user._id;
  
      await NotificationModel.updateMany(
        {
          receivers: { $in: [userId] },
          readBy: { $ne: userId }
        },
        {
          $push: { readBy: userId }
        }
      );
  
      res.status(200).json({ message: "Marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error updating notifications", error });
    }
  };
  

  export const deleteNotification = async (req, res) => {
    try {
      const { id } = req.params; 
      const userId = req.user._id;
      const userRole = req.user.role;
  
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Access denied. Only admins can delete notifications." });
      }
  

      const notification = await NotificationModel.findOne({ _id: id, senderId: userId });
  
      if (!notification) {
        return res.status(404).json({ message: "Notification not found or you are not the sender." });
      }
  
      await NotificationModel.findByIdAndDelete(id);
  
      return res.status(200).json({ message: "Notification deleted successfully." });
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ message: "Failed to delete notification", error: error.message });
    }
  };
  