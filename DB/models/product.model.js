import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now },
    createdBy:{type: mongoose.Schema.Types.ObjectId, ref: "user", required: true}

});

const productModel = mongoose.model("Product", productSchema);
export default productModel;
