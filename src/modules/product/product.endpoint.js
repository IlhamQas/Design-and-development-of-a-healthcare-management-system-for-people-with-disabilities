import { roles } from "../../Servicess/roles.js";
export const endPoints={
    add:[roles.Marketing_Agents],
    delete:[roles.Marketing_Agents],
    update:[roles.Marketing_Agents],
    show:[roles.Marketing_Agents,roles.Guardian , roles.Specialist,roles.Manger,roles.Guest  ]
}