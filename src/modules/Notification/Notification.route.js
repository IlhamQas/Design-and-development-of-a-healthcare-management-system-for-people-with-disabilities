import { Router } from "express";
import * as NotificationRoute from './controller/Notification.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./Notification.endpoint.js";

const NotificationRouter=Router();
NotificationRouter.post('/sendNotification',auth(endPoints.createNotification),NotificationRoute.sendNotification)
NotificationRouter.get('/allNotification',auth(endPoints.getNotifications),NotificationRoute.getNotifications)
NotificationRouter.patch('/readNotification',auth(endPoints.markNotificationsAsRead),NotificationRoute.markNotificationsAsRead)
NotificationRouter.delete('/deleteNotification/:id',auth(endPoints.deleteNotification),NotificationRoute.deleteNotification)
export default NotificationRouter;