import medicalReportModel from "../../../../DB/models/medicalReportModel.js";
import { userModel } from "../../../../DB/models/user.model.js";


export const addMedicalReport = async (req, res) => {
    try {
        const {id}=req.params;
        const {childBD, motorSkillsLarge, motorSkillsFine, selfCareSkills, cognitiveSkills, socialBehaviorSkills, recommendations, reportDate } = req.body;
        const specialistId = req.user._id;

        const patient = await userModel.findById(id);
           
        if (!patient || patient.role !== "guardian") {
            return res.status(404).json({ message: "المريض غير موجود." });
        }

          const newReport = new medicalReportModel({
          patientId:id,
          specialistId,
          childBD,
          motorSkillsLarge,
          motorSkillsFine,
          selfCareSkills,
          cognitiveSkills,
          socialBehaviorSkills,
          recommendations,
          reportDate
    });
        
        await newReport.save();

        res.status(201).json({ message: "تمت إضافة التقرير الطبي بنجاح", report: newReport });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};


export const getName = async(req,res) => {
    try {
        const patientId = req.params.id;
        const specialistId = req.user._id;

        const patient = await userModel.findById(patientId).select('name');
        const specialist = await userModel.findById(specialistId).select('name');

        if (!patient || !specialist) {
            return res.status(404).json({ message: "مستخدم غير موجود" });
        }

        res.status(200).json({
            patientName: patient.name,
            specialistName: specialist.name
        });

    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }

}



export const getAllMedicalReports = async (req, res) => {
    try {
        const reports = await medicalReportModel.find()
        .populate("patientId", "name")        
        .populate("specialistId", "name");
         
        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};



export const getReportsByuserId = async (req, res) => {
    try {
        const patientId = req.params.id;
        const specialistId = req.user.id;  // أو req.user._id حسب تنفيذك

        const reports = await medicalReportModel.find({ 
            patientId,
            specialistId
        })
        .populate('patientId', 'name')
        .populate('specialistId', 'name');

        if (!reports.length) {
            return res.status(404).json({ message: "لا توجد تقارير لهذا المريض للطبيب الحالي." });
        }

        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};




export const getMedicalReportsByUser = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const reports = await medicalReportModel
        .find({ patientId: userId })
        .populate("patientId", "name")        
        .populate("specialistId", "name");

        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};


export const deleteMedicalReport = async (req, res) => {
    try {
        const { id } = req.params;

        let report;
        report = await medicalReportModel.findById(id);

        if (!report) {
            return res.status(403).json({ message: "لا يمكنك حذف هذا التقرير." });
        }

        await medicalReportModel.findByIdAndDelete(id);
        res.status(200).json({ message: "تم حذف التقرير بنجاح" });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};


export const getReportsBySpecialist = async (req, res) => {
    try {
      const specialistId = req.user._id; 
  
      const reports = await medicalReportModel.find({ specialistId })
        .populate("patientId", "name")
        .populate("specialistId", "name");
  
      if (!reports.length) {
        return res.status(404).json({ message: "لا توجد تقارير لهذا الطبيب." });
      }
  
      res.status(200).json({ reports });
    } catch (error) {
      res.status(500).json({ message: `خطأ: ${error.message}` });
    }
  };
  
