import { roles } from "../../Servicess/roles.js";

export const endPoints={
    addMedicalReport :[roles.Manger,roles.Specialist],
    getAllMedicalReports :[roles.Manger ,roles.Specialist],
    getMedicalReportsByUser:[roles.Guardian],
    updateMedicalReport :[roles.Manger , roles.Specialist],
    deleteMedicalReport :[roles.Manger, roles.Specialist]
}