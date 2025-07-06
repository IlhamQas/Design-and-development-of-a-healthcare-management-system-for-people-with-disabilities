import { Router } from "express";
import * as adminRoute from './controller/Admin.controller.js'
import { endpoints } from "./Admin.endpoint.js";
import { auth } from "../../midlleWare/auth.js";
import { fileValidation, myMulter } from "../../Servicess/multer.js";

const adminRouter=Router()
adminRouter.post('/addUser',myMulter(fileValidation.imag).single('image'), auth(endpoints.addUser), adminRoute.addUser)
adminRouter.get('/allUser', auth(endpoints.showUser),adminRoute.showAllUser)
adminRouter.get('/user/:id', auth(endpoints.user),adminRoute.showUserById)
adminRouter.delete('/deleteUser/:id', auth(endpoints.deleteUser),adminRoute.deleteUser)
adminRouter.patch('/update/:id', auth(endpoints.updateUser), adminRoute.updateUser)
adminRouter.get('/getMangerAdmin', auth(endpoints.user), adminRoute.getManagers)
adminRouter.get('/getSystemStats', auth(endpoints.user), adminRoute.getSystemStats)

export default adminRouter


