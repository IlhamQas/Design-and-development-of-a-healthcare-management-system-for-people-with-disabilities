import { Router } from "express";
import * as DoctorScheduleRoute from './controller/DoctorSchedule.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./DoctorSchedule.endpoint.js";

const DoctorScheduleRouter=Router();
DoctorScheduleRouter.post('/addS/:doctorId',auth(endPoints.add),DoctorScheduleRoute.addSchedulee)
DoctorScheduleRouter.get('/all',auth(endPoints.all),DoctorScheduleRoute.showAll)
DoctorScheduleRouter.get('/allbyId/:doctorId',auth(endPoints.allbyid),DoctorScheduleRoute.ShowById)
DoctorScheduleRouter.delete('/delete/:doctorId/:dayOfWeek/:time',auth(endPoints.delete),DoctorScheduleRoute.deleteSpecificTime)
DoctorScheduleRouter.patch('/update/:doctorId/:dayOfWeek/:oldTime',auth(endPoints.update),DoctorScheduleRoute.updateSpecificTime)
DoctorScheduleRouter.delete('/deleteS/:doctorId',auth(endPoints.delete),DoctorScheduleRoute.deleteDoctorSchedule)
DoctorScheduleRouter.get('/fixed',auth(endPoints.all),DoctorScheduleRoute.fixLostAvailableSlots)
DoctorScheduleRouter.get('/getS/:id',auth(endPoints.all),DoctorScheduleRoute.displayDoctorSchedule)
export default DoctorScheduleRouter;

