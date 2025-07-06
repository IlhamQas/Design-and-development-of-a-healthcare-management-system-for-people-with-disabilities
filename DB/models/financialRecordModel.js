import mongoose from "mongoose";

const financialRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
    type: { type: String, enum: ["credit", "debit"], required: true }, 
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    balanceAfterTransaction: { type: Number, required: true }, 
    createdAt: { type: Date, default: Date.now }
});

const financialRecordModel = mongoose.model("FinancialRecord", financialRecordSchema);
export default financialRecordModel;
