import { Router } from "express";
import * as sessionRecordRoute from './controller/sessionRecord.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./sessionRecord.endpoint.js";
import { fileValidation, myMulter } from "../../Servicess/multer.js";

const sessionRecordRouter =Router();

sessionRecordRouter.get('/getG',auth(endPoints.get),sessionRecordRoute.getGuardianNotes)
sessionRecordRouter.post('/add',myMulter(fileValidation.all).single('media'),auth(endPoints.add),sessionRecordRoute.addSessionNote)
sessionRecordRouter.get('/getD',auth(endPoints.add),sessionRecordRoute.getDoctorNotes)
sessionRecordRouter.put('/update/:noteId',myMulter(fileValidation.all).single('media'),auth(endPoints.update),sessionRecordRoute.updateSessionNote)
sessionRecordRouter.delete('/delete/:noteId',auth(endPoints.delete),sessionRecordRoute.deleteSessionNote)
sessionRecordRouter.get('/getImprovment',auth(endPoints.get),sessionRecordRoute.getSessionImprovement)
sessionRecordRouter.get('/guardian-notes/:guardianId',auth(endPoints.getbyid),sessionRecordRoute.getNotesByGuardian)
sessionRecordRouter.get('/getImprovementByChild/:guardianId',auth(endPoints.getbyid),sessionRecordRoute.getSessionImprovementdoctor)
sessionRecordRouter.get('/getallImprovment',auth(endPoints.getm),sessionRecordRoute.getAllImprovementLevels)
sessionRecordRouter.get('/getallImprovmentbydoctor',auth(endPoints.getbyid),sessionRecordRoute.getImprovementLevelsForDoctorChildren)
export default sessionRecordRouter;