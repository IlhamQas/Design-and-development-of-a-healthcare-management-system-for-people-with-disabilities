import { Router } from "express";
import * as pendingAppointmentRoute from './controller/pendingAppointment.controller.js'
import { endpoints } from "./pendingAppointment.endpoint.js";
import { auth } from "../../midlleWare/auth.js";

const pendingAppointmentRouter=Router();
pendingAppointmentRouter.post('/change/:id',auth(endpoints.accept),pendingAppointmentRoute.controlPending)
pendingAppointmentRouter.delete('/delete/:id',auth(endpoints.delete),pendingAppointmentRoute.deleteAppintment)
pendingAppointmentRouter.put('/update/:id', auth(endpoints.update), pendingAppointmentRoute.updateAppointment)
pendingAppointmentRouter.get('/all',auth(endpoints.showAll),pendingAppointmentRoute.showAll)
pendingAppointmentRouter.get('/app/:id',auth(endpoints.showById),pendingAppointmentRoute.showById)
export default pendingAppointmentRouter