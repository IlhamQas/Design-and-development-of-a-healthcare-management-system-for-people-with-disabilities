import { DepartmentModel } from "../../../../DB/models/department.model.js";
import { userModel } from "../../../../DB/models/user.model.js";

export const AddDep = async (req, res) => {
    try {
      const { name } = req.body;
  
      const newDepartment = await DepartmentModel.create({
        name,
        doctors: []
      });
  
      return res.status(201).json({ message: "Department created successfully", department: newDepartment });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };


  export const findAllDepartments = async (req, res) => {
    try {
      const departments = await DepartmentModel.find(); 
  
      if (!departments || departments.length === 0) {
        return res.status(404).json({ message: "No departments found" });
      }
  
      const cleanedDepartments = [];
  
      for (const dep of departments) {
        const validDoctors = [];
  
        for (const doc of dep.doctors) {
          const doctorExists = await userModel.exists({ _id: doc.doctorId });
          if (doctorExists) {
            validDoctors.push(doc);
          }
        }
  
       
        if (validDoctors.length !== dep.doctors.length) {
          dep.doctors = validDoctors;
          await dep.save(); 
        }
  
        cleanedDepartments.push(dep);
      }
  
      return res.status(200).json({ message: "All departments", departments: cleanedDepartments });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };




  export const findAllBYID=async(req,res)=>{
    const {departmentId}=req.params;
    const department = await DepartmentModel.findById(departmentId);
    if(!department){
        return res.status(404).json({ message: "Department not found" });
    }else{

        return res.status(200).json({message:"all", department})
    }
  }
  


  export const ADDDoctor = async (req, res) => {
    try {
      const { departmentId, doctorId } = req.params;
  
      const doctor = await userModel.findById(doctorId);
     
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
  
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      if (doctor.role !== 'specialist') {
        return res.status(403).json({ message: "User is not a specialist" });
      }
  
    
      const alreadyAdded = department.doctors.find(d => d.doctorId.toString() === doctorId);
   
      if (alreadyAdded) {
        return res.status(400).json({ message: "Doctor already added to department" });
      }
  
      department.doctors.push({
        doctorId: doctor._id,
        doctorName: doctor.name
      });
  
      await department.save();
  
      return res.status(200).json({ message: "Doctor added to department successfully", department });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  
  export const removeDoctorFromDepartment = async (req, res) => {
    try {
      const { departmentId, doctorId } = req.params;
  
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
  
      const beforeCount = department.doctors.length;
  
      
      department.doctors = department.doctors.filter(d => d.doctorId.toString() !== doctorId);
  
      if (department.doctors.length === beforeCount) {
        return res.status(404).json({ message: "Doctor not found in this department" });
      }
  
      await department.save();
  
      return res.status(200).json({ message: "Doctor removed from department successfully", department });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  


  export const deleteDepartment = async (req, res) => {
    try {
      const { departmentId } = req.params;
  
      const department = await DepartmentModel.findById(departmentId);
  
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
  
      if (department.doctors.length > 0) {
        return res.status(400).json({ message: "Cannot delete department with doctors. Please remove doctors first." });
      }
  
      await DepartmentModel.findByIdAndDelete(departmentId);
  
      return res.status(200).json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };


  export const updateDepartmentName = async (req, res) => {
    try {
      const { departmentId } = req.params;
      const { name } = req.body;
  
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "New name is required" });
      }
  
      const department = await DepartmentModel.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
  
      department.name = name;
      await department.save();
  
      return res.status(200).json({ message: "Department name updated successfully", department });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  


export const getOccupationalDoctors = async (req, res) => {
  try {
    const department = await DepartmentModel.findOne({ name: "Occupational Therapy Department" });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const doctors = department.doctors;

    res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
