import { get } from "mongoose";
import { roles } from "../../Servicess/roles.js";
export const endPoints={
    add:[roles.Specialist],
    delete:[roles.Specialist],
    all:[roles.Specialist,roles.Guardian],
    update:[roles.Specialist],
    get:[roles.Guardian ],
    getbyid:[roles.Specialist],
    getm:[roles.Manger]
  
}