import { roles } from "../../Servicess/roles.js";

export const endpoints={
    addUser:[roles.Admin],
    deleteUser:[roles.Admin],
    updateUser:[roles.Admin,roles.Manger],
    showUser:[roles.Admin , roles.Manger,roles.Specialist ],
    user:[roles.Admin , roles.Manger , roles.Marketing_Agents , roles.Specialist, roles.Guardian]
}
