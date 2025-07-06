import { Router } from "express";
import { auth } from "../../midlleWare/auth.js";
import * as ContactRoute from './controller/contact.controller.js'
import { endPoints } from "./contact.endpoints.js";

const ContactRouter=Router();
ContactRouter.post('/add', auth(endPoints.add), ContactRoute.addLocation)
ContactRouter.delete('/delete/:id',auth(endPoints.delete),ContactRoute.deleteLocation)
ContactRouter.get('/all',auth(endPoints.all),ContactRoute.findAll )
ContactRouter.get('/find/:id',auth(endPoints.allbyid),ContactRoute.findById)
export default ContactRouter;