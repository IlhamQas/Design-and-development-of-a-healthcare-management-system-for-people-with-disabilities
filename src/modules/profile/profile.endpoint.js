import { roles } from "../../Servicess/roles.js";

export const endPoints={
    add:[roles.Admin , roles.Guardian , roles.Manger , roles.Specialist , roles.Marketing_Agents],
    getProfile :[roles.Admin , roles.Guardian , roles.Manger , roles.Specialist , roles.Marketing_Agents],
    updateProfile :[roles.Admin , roles.Guardian , roles.Manger , roles.Specialist , roles.Marketing_Agents]
}