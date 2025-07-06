import  TreatmentPlanModel  from "../../../../DB/models/TreatmentPlan.model.js";
import EvaluationModel from '../../../../DB/models/ChildEvaluation.model.js';


export const createTreatmentPlan = async (req, res) => {
  try {
    const { evaluationId } = req.body;

    const evaluation = await EvaluationModel.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    const treatmentPlan = new TreatmentPlanModel({
      evaluationId,
      guardianId: evaluation.guardianId,
      createdBy: req.user._id,
      diagnosis: req.body.diagnosis,
      plan_date: req.body.plan_date,
      approval_date: req.body.approval_date,
      healthStatus:req.body.healthStatus ||[], 
      services: req.body.services || [],
      team: req.body.team || [],
      initialAssessment: req.body.initialAssessment, 
      goals: req.body.goals,                        
    });
    

    await treatmentPlan.save();

    res.status(201).json({ message: 'Treatment plan created successfully', treatmentPlan });

  } catch (error) {
    console.error('Error creating treatment plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


 
export const getAllTreatmentPlans = async (req, res) => {
  try {
    const plans = await TreatmentPlanModel.find()
      .populate({
        path: 'evaluationId',
        select: 'guardianId diagnosis date',
        populate: {
          path: 'guardianId',
          select: 'name email phone',
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    res.status(200).json({ message: "جميع الخطط العلاجية", data: plans });
  } catch (error) {
    console.error("Error fetching treatment plans:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الخطط", error });
  }
};


  export const getTreatmentPlanByGuardianId = async (req, res) => {
    const { guardianId } = req.params;
  
    try {
      const plan = await TreatmentPlanModel.findOne({ guardianId })
      .populate({
        path: 'createdBy',
        select: 'name email', 
      });

      if (!plan) {
        return res.status(404).json({ message: "الخطة غير موجودة" });
      }
  
      res.status(200).json({ message: "الخطة المطلوبة", data: plan });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب الخطة", error });
    }
  };
  


export const getTreatmentPlanByName = async (req, res) => {
    const { name } = req.params;
  
    try {
      const plan = await TreatmentPlanModel.findOne({ name: name });
  
      if (!plan) {
        return res.status(404).json({ message: "لا توجد خطة باسم هذا الطفل" });
      }
  
      res.status(200).json({ message: "تم جلب الخطة بنجاح", data: plan });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب الخطة", error });
    }
  };


  
  export const deleteTreatmentPlan = async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user._id; 
  
    try {
      const plan = await TreatmentPlanModel.findById(id);
  
      if (!plan) {
        return res.status(404).json({ message: "الخطة غير موجودة" });
      }
  
      if (plan.createdBy.toString() !== doctorId.toString()) {
        return res.status(403).json({ message: "غير مصرح لك بحذف هذه الخطة" });
      }
  
      await TreatmentPlanModel.findByIdAndDelete(id);
      res.status(200).json({ message: "تم حذف الخطة بنجاح" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "حدث خطأ أثناء الحذف", error });
    }
  };
  




  