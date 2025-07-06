import { Router } from "express";
import * as chatRoute from './controller/chat.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endpoints } from "./chat.endpoint.js";
import { fileValidation, myMulter } from "../../Servicess/multer.js";

const chatRouter=Router();
chatRouter.post('/sendMessage',myMulter(fileValidation.all).single('media'),auth(endpoints.add),chatRoute.sendMessage)
chatRouter.get('/getMessage/:senderId/:receiverId',auth(endpoints.show),chatRoute.getMessage)
chatRouter.get('/getAllMessage',auth(endpoints.show),chatRoute.getAllUserMessages)
chatRouter.patch('/markMessageAsRead',auth(endpoints.show),chatRoute.markMessagesAsRead)
chatRouter.get('/getallchat',auth(endpoints.show),chatRoute.getAllChatToMe)

export default chatRouter;