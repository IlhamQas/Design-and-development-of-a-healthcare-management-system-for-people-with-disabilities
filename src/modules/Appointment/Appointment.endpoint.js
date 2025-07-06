import { roles } from "../../Servicess/roles.js";

export const endpoints={
    add:[roles.Guardian,roles.Admin,roles.Specialist,roles.Manger],
    manegeNot:[roles.Admin,roles.Manger]
}