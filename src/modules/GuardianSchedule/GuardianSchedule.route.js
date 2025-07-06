import { Router } from "express";
import * as GuardianScheduleRoute from './controller/GuardianSchedule.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./GuardianSchedule.endpoint.js";

const GuardianScheduleRouter =Router();

GuardianScheduleRouter.post('/Request',auth(endPoints.all),GuardianScheduleRoute.submitGuardianScheduleRequest)
GuardianScheduleRouter.patch('/approve/:requestId',auth(endPoints.update),GuardianScheduleRoute.approveGuardianScheduleRequest)
GuardianScheduleRouter.get('/get',auth(endPoints.add),GuardianScheduleRoute.getPendingScheduleRequests)
GuardianScheduleRouter.get('/getStatas',auth(endPoints.all),GuardianScheduleRoute.getModifingScheduleRequests)
GuardianScheduleRouter.get('/getSchedule/:id',auth(endPoints.all),GuardianScheduleRoute.getApprovedScheduleForGuardian)
GuardianScheduleRouter.put("/update/:requestId/:sessionId",auth(endPoints.all), GuardianScheduleRoute.requestModifySession)
GuardianScheduleRouter.put('/approveupdate/:sessionId/:requestId',auth(endPoints.update),GuardianScheduleRoute.approveModifiedSession)
GuardianScheduleRouter.put('/reject/:sessionId/:requestId',auth(endPoints.delete),GuardianScheduleRoute.rejectModifiedSession)
GuardianScheduleRouter.get('/getallStatas',auth(endPoints.all),GuardianScheduleRoute.getGuardianScheduleStatus)
GuardianScheduleRouter.get('/getdoctors/:guardianId',auth(endPoints.get),GuardianScheduleRoute.getDoctorsForGuardian)
GuardianScheduleRouter.get('/getguardian',auth(endPoints.getg),GuardianScheduleRoute.getGuardiansForDoctor)
GuardianScheduleRouter.post('/addextraSession',auth(endPoints.update),GuardianScheduleRoute.addGuardianSession)
GuardianScheduleRouter.put("/editSession",auth(endPoints.update), GuardianScheduleRoute.updateGuardianSession)
GuardianScheduleRouter.delete("/deleteSession",auth(endPoints.delete), GuardianScheduleRoute.deleteGuardianSession)
GuardianScheduleRouter.get('/getguardianSchedule/:id',auth(endPoints.getg),GuardianScheduleRoute.getGuardianSchedule)
GuardianScheduleRouter.get('/getguardianScheduleRequest',auth(endPoints.all),GuardianScheduleRoute.getAllGuardianScheduleRequests)
export default GuardianScheduleRouter;