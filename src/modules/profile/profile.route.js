import { Router } from "express";
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./profile.endpoint.js";
import * as profileRoute from './controller/profile.controller.js'
const profileRouter=Router();
profileRouter.post('/addProfile', auth(endPoints.add), profileRoute.addProfile)
profileRouter.get('/getProfile', auth(endPoints.getProfile), profileRoute.getProfile)
profileRouter.patch('/updateProfile', auth(endPoints.updateProfile),profileRoute.updateProfile)
profileRouter.get('/viewProfile/:id',auth(endPoints.getProfile),profileRoute.viewUserProfile)
export default profileRouter;