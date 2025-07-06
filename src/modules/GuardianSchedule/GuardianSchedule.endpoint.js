import { roles } from "../../Servicess/roles.js";
export const endPoints={
    add:[roles.Manger],
    delete:[roles.Manger,roles.Guardian],
    all:[roles.Manger , roles.Specialist,roles.Guardian,roles.Admin],
    allbyid:[roles.Manger , roles.Specialist,roles.Guardian,roles.Admin],
    update:[roles.Manger],
    get:[roles.Guardian, roles.Specialist],
    getg:[roles.Specialist]
  

  
}