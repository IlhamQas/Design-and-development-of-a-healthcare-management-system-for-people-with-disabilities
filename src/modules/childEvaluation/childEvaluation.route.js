import { Router } from "express";
import * as childEvaluationRoute from './controller/childEvaluation.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./childEvaluation.endpoint.js";

const childEvaluationRouter=Router();
childEvaluationRouter.post('/addEvaluation/:id',auth(endPoints.add),childEvaluationRoute.createEvaluation)
childEvaluationRouter.get('/get/:id',auth(endPoints.all),childEvaluationRoute.getEvaluationsByGuardian)
childEvaluationRouter.delete('/delete/:id',auth(endPoints.delete),childEvaluationRoute.deleteEvaluation)
childEvaluationRouter.get('/getbySpecialist',auth(endPoints.all),childEvaluationRoute.getEvaluationsForSpecialist)
childEvaluationRouter.get('/getall',auth(endPoints.update),childEvaluationRoute.getAllEvaluations)
childEvaluationRouter.get('/getmyEvaluation/:id',auth(endPoints.all),childEvaluationRoute.getMyEvaluations)


export default childEvaluationRouter;

