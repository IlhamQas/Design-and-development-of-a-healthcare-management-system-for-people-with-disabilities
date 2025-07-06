import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
    specialistId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    childBD: { type: Date, required: true },
    motorSkillsLarge: { type: String },
    motorSkillsFine: { type: String },
    selfCareSkills: { type: String },
    cognitiveSkills: { type: String },
    socialBehaviorSkills: { type: String },
    recommendations: { type: String },
    reportDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});


const medicalReportModel = mongoose.model("MedicalReport", medicalReportSchema);
export default medicalReportModel;
