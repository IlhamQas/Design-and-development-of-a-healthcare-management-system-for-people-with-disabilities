import { roles } from "../../Servicess/roles.js";

   export const endPoints={
    add:[roles.Guardian],
    delete:[roles.Guardian],
    all:[roles.Manger , roles.Marketing_Agents],
    allbyid:[roles.Admin , roles.Guardian, roles.Manger , roles.Specialist , roles.Marketing_Agents],
    check:[roles.Guardian],
    allOrder:[roles.Admin , roles.Marketing_Agents]
}