import { roles } from "../../Servicess/roles.js";
export const endPoints={
    add:[roles.Admin ,roles.Manger, roles.Specialist],
    delete:[roles.Manger,roles.Admin],
    all:[roles.Manger , roles.Specialist,roles.Guardian,roles.Admin],
    allbyid:[roles.Manger , roles.Specialist,roles.Guardian,roles.Admin],
    update:[roles.Manger],
  
}
