import { Router } from "express";
import { fileValidation, myMulter } from "../../Servicess/multer.js";
import { auth } from "../../midlleWare/auth.js";
import * as updateimg from './controller/UpdateImageProfile.controller.js'
import { endPoints } from "./UpdateImageProfile.endpoint.js";

const updatedProfileimage=Router();
updatedProfileimage.patch('/update',auth(endPoints.add),myMulter(fileValidation.imag).single('image'),updateimg.UdateImage)
updatedProfileimage.patch('/updatePassword',auth(endPoints.add),updateimg.updatePassword)
export default updatedProfileimage
