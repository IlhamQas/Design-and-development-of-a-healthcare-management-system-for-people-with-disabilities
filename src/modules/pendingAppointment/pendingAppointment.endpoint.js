import { roles } from "../../Servicess/roles.js";

export const endpoints={
    accept:[roles.Admin , roles.Manger, roles.Specialist],
    delete:[roles.Admin , roles.Manger, roles.Specialist],
    update:[roles.Admin , roles.Manger, roles.Specialist],
    showAll:[roles.Admin , roles.Manger, roles.Specialist],
    showById:[roles.Admin , roles.Manger, roles.Specialist, roles.Guardian]
}