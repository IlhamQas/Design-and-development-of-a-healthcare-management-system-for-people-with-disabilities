import Router from 'express'
import * as pendingRoute from './controller/pending.controller.js'
import { auth } from '../../midlleWare/auth.js';
import { endPoint } from './pending.endpoint.js';

const pendingRouter=Router();
pendingRouter.post('/change/:id', auth(endPoint.proccesPendingReq),pendingRoute.proccesPendingReq)
export default pendingRouter
