import  EvaluationModel  from "../../../../DB/models/ChildEvaluation.model.js";
import { userModel } from "../../../../DB/models/user.model.js";
import GuardianScheduleModel  from '../../../../DB/models/GuardianSchedule.model.js';


export const createEvaluation = async (req, res) => {
  try {
    const specialistId = req.user._id;
    const guardianId = req.params.id;

   
    const guardian = await userModel.findById(guardianId);
    if (!guardian) {
      return res.status(404).json({ message: "Guardian not found." });
    }

    if (guardian.role !== "guardian") {
      return res.status(400).json({ message: "Provided ID does not belong to a guardian." });
    }

   
    const existingEvaluation = await EvaluationModel.findOne({ guardianId });
    if (existingEvaluation) {
      return res.status(400).json({ 
        message: "An evaluation for this guardian already exists. You cannot create another one." 
      });
    }


    const evaluationData = {
      ...req.body,
      guardianId,
      specialistId
    };

    const evaluation = new EvaluationModel(evaluationData);
    await evaluation.save();

    res.status(201).json({ message: "Evaluation created successfully", evaluation });

  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({ message: "Failed to create evaluation", error });
  }
};





export const deleteEvaluation = async (req, res) => {
  try {
    const evaluationId = req.params.id;
    const specialistId = req.user._id;
    const evaluation = await EvaluationModel.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    if (evaluation.specialistId.toString() !== specialistId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this evaluation" });
    }

    await EvaluationModel.findByIdAndDelete(evaluationId);

    res.status(200).json({ message: "Evaluation deleted successfully" });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    res.status(500).json({ message: "Failed to delete evaluation", error });
  }
};



export const getEvaluationsByGuardian = async (req, res) => {
  try {
    const guardianId = req.params.id ;

    const evaluation = await EvaluationModel.findOne({ guardianId }).populate({
      path: 'specialistId',
      select: 'name', 
    });

    res.json({ evaluation });
  } catch (error) {
    console.error("Error getting evaluations:", error);
    res.status(500).json({ message: "Failed to retrieve evaluations", error });
  }
};



export const getEvaluationsForSpecialist = async (req, res) => {
  try {
    const specialistId = req.user._id;


    const schedules = await GuardianScheduleModel.find({
      "sessions.specialistId": specialistId,
    });

 
    const guardianIds = new Set();
    schedules.forEach(schedule => {
      const hasSession = schedule.sessions.some(
        session => session.specialistId.toString() === specialistId.toString()
      );
      if (hasSession) {
        guardianIds.add(schedule.guardianId.toString());
      }
    });

    if (guardianIds.size === 0) {
      return res.status(200).json({ evaluations: [] });
    }


    const evaluations = await EvaluationModel.find({
      guardianId: { $in: Array.from(guardianIds) }
    }).populate([
      { path: 'guardianId', select: 'name email' },
      { path: 'specialistId', select: 'name' }
    ]);

    res.status(200).json({ evaluations });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await EvaluationModel.find().populate([
      { path: 'guardianId', select: 'name email' },
      { path: 'specialistId', select: 'name' }
    ]);

    res.status(200).json({ evaluations });
  } catch (error) {
    console.error("Error fetching all evaluations:", error);
    res.status(500).json({ message: "Failed to fetch evaluations", error });
  }
};



export const getMyEvaluations = async (req, res) => {
  try {
    const specialistId = req.params.id;

    const evaluations = await EvaluationModel.find({ specialistId }).populate([
      { path: 'guardianId', select: 'name email' },
      { path: 'specialistId', select: 'name email' },
    ]);

    res.status(200).json({ evaluations });
  } catch (error) {
    console.error("Error fetching specialist evaluations:", error);
    res.status(500).json({ message: "Failed to fetch your evaluations", error });
  }
};
