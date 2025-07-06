import { roles } from "../../Servicess/roles.js";

export const endpoints={
    add:[roles.Admin , roles.Manger, roles.Specialist,roles.Guardian],
    show:[roles.Admin , roles.Manger, roles.Specialist,roles.Guardian]

}