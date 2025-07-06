import { Router } from "express";
import * as finacialRoute from './controller/financialRecord.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./financialRecord.endpoint.js";


const financialRouter=Router();
financialRouter.post('/add/:id',auth(endPoints.add), finacialRoute.addCredit)
financialRouter.delete('/delete/:id',auth(endPoints.delete),finacialRoute.deleteCredit)
financialRouter.get('/all', auth(endPoints.all), finacialRoute.findAll)
financialRouter.get('/find',auth(endPoints.allbyid),finacialRoute.getFinancialRecords)
export default financialRouter