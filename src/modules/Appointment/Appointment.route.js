import { Router } from "express";
import express from "express";
import * as AppointmentRoute from './controller/Appointment.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endpoints } from "./Appointment.endpoint.js";

const AppointmentRouter=Router()
AppointmentRouter.post('/add',AppointmentRoute.addAppointment)
AppointmentRouter.get('/all',auth(endpoints.manegeNot),AppointmentRoute.getAllAppointments)
AppointmentRouter.post('/addMod/:appointmentId',auth(endpoints.add),AppointmentRoute.requestModificationOrCancellation)
AppointmentRouter.post('/manageModificationRequest/:appointmentId', auth(endpoints.manegeNot),AppointmentRoute.manageModificationOrCancellationRequest)
AppointmentRouter.post("/reschedule/:id",express.urlencoded({ extended: true }), AppointmentRoute.rescheduleFromForm)
AppointmentRouter.get("/reschedule-form/:id",AppointmentRoute.renderRescheduleForm)
AppointmentRouter.get("/cancel/:id", AppointmentRoute.cancelPendingAppointment)
export default AppointmentRouter;   
