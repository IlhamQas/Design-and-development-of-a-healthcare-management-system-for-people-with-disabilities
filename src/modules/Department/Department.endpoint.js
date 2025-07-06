import { roles } from "../../Servicess/roles.js";
export const endPoints={
    add:[roles.Manger,roles.Admin],
    delete:[roles.Manger,roles.Admin],
    all:[roles.Manger , roles.Specialist,roles.Guardian,roles.Admin],
    allbyid:[roles.Manger , roles.Specialist,roles.Guardian,roles.Admin],
    update:[roles.Manger,roles.Admin],
    get:[roles.Admin,roles.Manger,roles.Specialist]
  
}
