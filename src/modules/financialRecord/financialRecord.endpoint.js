import { roles } from "../../Servicess/roles.js";

   export const endPoints={
    add:[roles.Marketing_Agents,roles.Manger,roles.Admin],
    delete:[roles.Marketing_Agents,roles.Manger,roles.Admin],
    all:[roles.Marketing_Agents,roles.Manger,roles.Admin],
    allbyid:[roles.Guardian, roles.Marketing_Agents,roles.Admin , roles.Manger],
  
}