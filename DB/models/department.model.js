import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  doctors: [
    {
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
      doctorName: { type: String, required: true }
    }
  ]
});

const DepartmentModel = mongoose.model('Department', DepartmentSchema);
export { DepartmentModel };
