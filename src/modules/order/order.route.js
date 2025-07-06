import { Router } from "express";
import * as orderRoute from './controller/order.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./order.endpoint.js";

const orderRouter=Router();
orderRouter.post('/add/:productId',auth(endPoints.add), orderRoute.addToCart)
orderRouter.delete('/delete/:productId', auth(endPoints.delete),orderRoute.removeFromCart)
orderRouter.get('/all',auth(endPoints.allbyid),orderRoute.getCart)
orderRouter.post('/check',auth(endPoints.check),orderRoute.checkout)
orderRouter.get('/allOrder', auth(endPoints.allOrder), orderRoute.showAllOrders);
orderRouter.patch('/accepted/:orderId',auth(endPoints.allOrder),orderRoute.acceptOrder)
orderRouter.patch('/rejected/:orderId', auth(endPoints.allOrder), orderRoute.rejectOrder)
orderRouter.get('/allacceptOrder', auth(endPoints.allbyid), orderRoute.getAcceptedOrdersByUserIdOrAll);

export default orderRouter