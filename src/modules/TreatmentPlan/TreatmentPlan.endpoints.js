import { roles } from "../../Servicess/roles.js";

export const endpoints={
    add:[roles.Admin , roles.Specialist,roles.Manger],
    delete:[roles.Admin , roles.Specialist,roles.Manger],
    show:[roles.Admin , roles.Specialist,roles.Manger, roles.Guardian],
    get:[roles.Admin , roles.Specialist,roles.Manger]
}