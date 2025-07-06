import {userModel} from "../../../../DB/models/user.model.js";
import profileModel from "../../../../DB/models/profileModel.js";
import medicalReportModel from "../../../../DB/models/medicalReportModel.js";
import {appointmentModel} from "../../../../DB/models/appointment.model.js";
import financialRecordModel from "../../../../DB/models/financialRecordModel.js";
import productModel from "../../../../DB/models/product.model.js";


export const addProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { phone, address, bio,  specialization, workplace } = req.body;

       
        const existingProfile = await profileModel.findOne({ userId });
        if (existingProfile) {
            return res.status(400).json({ message: "تم إنشاء البروفايل مسبقًا، يمكنك فقط تحديثه." });
        }

      
        const newProfile = new profileModel({
            userId,
            phone,
            address,
            bio,
            specialization,
            workplace
        });

        await newProfile.save();

        res.status(201).json({ message: "تمت إضافة البروفايل بنجاح", profile: newProfile });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};


export const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        let profile = await profileModel.findOne({ userId });
        
        if (!profile) {
            return res.status(404).json({ message: "لم يتم العثور على بروفايل لهذا المستخدم، يرجى إنشاؤه أولاً." });
        }

        let extraData = {};

        if (user.role === "guardian") {
            const medicalReports = await medicalReportModel.find({patientId: userId });
            const financialRecords = await financialRecordModel.find({ userId:userId });
            extraData = { medicalReports, financialRecords };
        }

        if (user.role === "specialist") {
            const createdReports = await medicalReportModel.find({ specialistId: userId });
            extraData = { createdReports };
        }

        if (user.role === "admin" || user.role === "manager" ) {
            const allUsers = await userModel.find().select("-password");
            const allMedicalReports = await medicalReportModel.find();
            const allFinancialRecords = await financialRecordModel.find();
            const allProfiles = await profileModel.find();

            extraData = { allUsers, allMedicalReports, allFinancialRecords, allProfiles };
        }
        if (user.role === "marketing_agents") {
            const myProducts = await productModel.find({ createdBy: userId });
            extraData = { myProducts };
        }


        res.status(200).json({ user, profile, ...extraData });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { phone, address, bio, specialization, workplace } = req.body;

        const updatedProfile = await profileModel.findOneAndUpdate(
            { userId },
            { phone, address, bio,  specialization, workplace },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: "البروفايل غير موجود" });
        }

        res.status(200).json({ message: "تم تحديث البروفايل بنجاح", updatedProfile });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};



export const viewUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId)
      .select("-password")
      .populate('department', 'name') 

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const profile = await profileModel.findOne({ userId });

    res.status(200).json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: `خطأ: ${error.message}` });
  }
};
