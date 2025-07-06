import { Router } from "express";
import * as authRoute from './controller/auth.controller.js'
import { validation } from "../../midlleWare/validation.js";
import { fileValidation, myMulter } from "../../Servicess/multer.js";
import * as validAuth from './auth.validation.js'

const authRouter=Router();
authRouter.post('/signup',myMulter(fileValidation.imag).single('image'),validation(validAuth.signup), authRoute.signup)
authRouter.get('/confirmEmail/:token',authRoute.confirmEmail)
authRouter.post('/signin',validation(validAuth.signin), authRoute.signin)
authRouter.patch('/sendcode',authRoute.sendCode)
authRouter.patch('/forgetpassword',authRoute.forgetPassward)
authRouter.post('/addAdmin', validation(validAuth.signup), authRoute.addAdmin)
authRouter.get('/loadSystemStats',authRoute.loadSystemStats)
export default authRouter

