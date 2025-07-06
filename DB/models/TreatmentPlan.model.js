import mongoose from "mongoose";

const supportServiceSchema = new mongoose.Schema({
    type: { type: String, required: true },         
    notes: { type: String },
    sessions: { type: Number }                    
  }, { _id: false });

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
});

const TreatmentPlanSchema = new mongoose.Schema({
  evaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChildEvaluation",
    required: true,
  },
  guardianId: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // ❖ البيانات الأساسية
  plan_date: { type: Date, required: true },
  diagnosis: { type: String },

  healthStatus: {
    hearing: { type: String },
    vision: { type: String },
    speech: { type: String },
    motor: { type: String },
  },
 
  // ❖ الخدمات المساندة
  services: [supportServiceSchema],

  // ❖ فريق العمل
  team: [TeamMemberSchema],
  approval_date: { type: Date },

  // ❖ نتائج التقييم الأولي
  initialAssessment: {
    motor: {
      strengths: { type: String },
      weaknesses: { type: String },
    },
    selfHelp: {
      strengths: { type: String },
      weaknesses: { type: String },
    },
    social: {
      strengths: { type: String },
      weaknesses: { type: String },
    },
    cognitive: {
      strengths: { type: String },
      weaknesses: { type: String },
    },
    communication: {
      strengths: { type: String },
      weaknesses: { type: String },
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", 
    required: true,
  },

  
  goals: {
    motor: { type: String },
    selfHelp: { type: String },
    social: { type: String },
    cognitive: { type: String },
    communication: { type: String },
  },
}, 
{ timestamps: true });

const TreatmentPlanModel = mongoose.model("TreatmentPlan", TreatmentPlanSchema);
export default TreatmentPlanModel;
