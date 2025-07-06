import { roles } from "../../Servicess/roles.js";
export const endPoints={
    add:[roles.Guardian],
    delete:[roles.Marketing_Agents,roles.Manger,roles.Admin, roles.Guardian],
    all:[roles.Marketing_Agents,roles.Manger,roles.Admin],
    allbyid:[roles.Guardian],
}