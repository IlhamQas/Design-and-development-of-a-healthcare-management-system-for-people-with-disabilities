import { Router } from "express";
import * as TreatmentPlanRoute from './controller/TreatmentPlan.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endpoints } from "./TreatmentPlan.endpoints.js";
const TreatmentPlanRouter=Router();
TreatmentPlanRouter.post('/add',auth(endpoints.add),TreatmentPlanRoute.createTreatmentPlan)
TreatmentPlanRouter.get('/show',auth(endpoints.show),TreatmentPlanRoute.getAllTreatmentPlans)
TreatmentPlanRouter.get('/show/:guardianId',auth(endpoints.show), TreatmentPlanRoute.getTreatmentPlanByGuardianId)
TreatmentPlanRouter.get('/show/:name',auth(endpoints.show), TreatmentPlanRoute.getTreatmentPlanByName)
TreatmentPlanRouter.delete('/delete/:id',auth(endpoints.delete),TreatmentPlanRoute.deleteTreatmentPlan)

export default TreatmentPlanRouter;