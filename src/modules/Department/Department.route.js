import { Router } from "express";
import { auth } from "../../midlleWare/auth.js";
import * as DepartmentRoute from './controller/Department.controller.js';
import { endPoints } from "./Department.endpoint.js";

const DepartmentRouter=Router();
DepartmentRouter.post('/addDep',auth(endPoints.add),DepartmentRoute.AddDep)
DepartmentRouter.post('/addDocToDep/:departmentId/:doctorId',auth(endPoints.add),DepartmentRoute.ADDDoctor)
DepartmentRouter.get('/all/:departmentId',auth(endPoints.all),DepartmentRoute.findAllBYID)
DepartmentRouter.delete('/deleteDep/:departmentId/:doctorId',auth(endPoints.delete),DepartmentRoute.removeDoctorFromDepartment)
DepartmentRouter.get('/allDep',auth(endPoints.all),DepartmentRoute.findAllDepartments)
DepartmentRouter.delete("/delete/:departmentId",auth(endPoints.delete),DepartmentRoute.deleteDepartment);
DepartmentRouter.put("/updateName/:departmentId",auth(endPoints.update), DepartmentRoute.updateDepartmentName);
DepartmentRouter.get('/OccupationalDoctor',auth(endPoints.get),DepartmentRoute.getOccupationalDoctors)
export default DepartmentRouter;