import { roles } from "../../Servicess/roles.js";

export const endPoints={
    createNotification:[roles.Admin,roles.Manger,roles.Specialist,roles.Guardian,roles.Marketing_Agents ],
    getNotifications:[roles.Admin , roles.Guardian,roles.Manger , roles.Specialist , roles.Marketing_Agents],
    markNotificationsAsRead:[ roles.Guardian,roles.Manger , roles.Specialist , roles.Marketing_Agents],
    deleteNotification:[roles.Admin ]
}

