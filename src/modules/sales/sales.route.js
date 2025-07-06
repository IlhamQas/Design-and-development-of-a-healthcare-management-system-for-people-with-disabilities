import { Router } from "express";
import * as salesRoute from './controller/sales.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./sales.endpoint.js";

const salesRouter=Router();
salesRouter.get('/all', auth(endPoints.show),salesRoute.getTotalSales)
salesRouter.get('/getTopSellingProducts',auth(endPoints.show),salesRoute.getTopSellingProducts)
salesRouter.get('/getMonthlyRevenue',auth(endPoints.show),salesRoute.getMonthlyRevenue)
export default salesRouter;