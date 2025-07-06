import { Router } from "express";
import * as productRoute from './controller/product.controller.js'
import { fileValidation, myMulter } from "../../Servicess/multer.js";
import { endPoints } from "./product.endpoint.js";
import { auth } from "../../midlleWare/auth.js";
const productRouter=Router();
productRouter.post('/add', auth(endPoints.add),myMulter(fileValidation.imag).single('image'), productRoute.addProduct)
productRouter.get('/show', productRoute.getAllProduct)
productRouter.get('/show/:id', auth(endPoints.show), productRoute.getProductById)
productRouter.delete('/delete/:id',auth(endPoints.delete),productRoute.deleteProduct)
productRouter.patch('/update/:id', auth(endPoints.update),myMulter(fileValidation.imag).single('image'),productRoute.updateProduct)
export default productRouter