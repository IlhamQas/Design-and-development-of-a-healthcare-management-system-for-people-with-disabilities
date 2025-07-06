import { Router } from "express";
import * as postRoute from './controller/post.controller.js'
import { auth } from "../../midlleWare/auth.js";
import { endPoints } from "./post.endpoint.js";
import { fileValidation, myMulter } from "../../Servicess/multer.js";
const postRouter=Router();
postRouter.post('/add/:id',auth(endPoints.add),myMulter(fileValidation.all).single('photo'),postRoute.AddPost)
postRouter.post('/addforall',auth(endPoints.add),myMulter(fileValidation.all).single('photo'),postRoute.AddPostForAllUsers)
postRouter.get('/allpost',auth(endPoints.show),postRoute.getAllPosts)
postRouter.get('/allpost/:id',auth(endPoints.show),postRoute.getUserPosts)
postRouter.delete('/deletePost/:id',auth(endPoints.delete),postRoute.deletePost)
postRouter.patch('/update/:id',auth(endPoints.update),myMulter(fileValidation.all).single('photo'),postRoute.updatePost)
export default postRouter