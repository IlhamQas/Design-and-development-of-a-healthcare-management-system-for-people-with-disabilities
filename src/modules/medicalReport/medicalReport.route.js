import { Router } from "express";
import * as medicalRoute from './controller/medicalReport.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./medicalReport.endpoint.js";

const medicalReportRouter=Router();
medicalReportRouter.post('/add/:id', auth(endPoints.addMedicalReport), medicalRoute.addMedicalReport)
medicalReportRouter.get('/getName/:id', auth(endPoints.addMedicalReport), medicalRoute.getName)
medicalReportRouter.get('/getAllMedicalReports', auth(endPoints.getAllMedicalReports),medicalRoute.getAllMedicalReports)
medicalReportRouter.get('/getUserReports/:id', auth(endPoints.getAllMedicalReports),medicalRoute.getReportsByuserId)
medicalReportRouter.get('/getMedicalReportsByUser', auth(endPoints.getMedicalReportsByUser),medicalRoute.getMedicalReportsByUser)
medicalReportRouter.delete('/deleteMedicalReport/:id', auth(endPoints.deleteMedicalReport),medicalRoute.deleteMedicalReport)
medicalReportRouter.get('/getReportsBYSpecialist', auth(endPoints.getAllMedicalReports),medicalRoute.getReportsBySpecialist)
export default medicalReportRouter