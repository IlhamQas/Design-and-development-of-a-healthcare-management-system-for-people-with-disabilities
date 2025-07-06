import { roles } from "../../Servicess/roles.js";
export const endPoints={
    add:[roles.Admin,roles.Manger,roles.Specialist],
    delete:[roles.Admin,roles.Manger,roles.Specialist],
    update:[roles.Admin,roles.Manger,roles.Specialist],
    show:[roles.Admin,roles.Manger,roles.Specialist,roles.Guardian]
}