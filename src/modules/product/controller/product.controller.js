import productModel from "../../../../DB/models/product.model.js";
import cloudenary from "../../../Servicess/cloudenary.js";
export const addProduct=async(req , res)=>{
    try {
        const { name, description, price, category, quantity, image,createdBy } = req.body;

        if (!name || !description || !price || !category ) {
            return res.status(400).json({ message: "يرجى إدخال جميع البيانات المطلوبة" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "الصورة مطلوبة" });
        }
        const { secure_url } = await cloudenary.uploader.upload(req.file.path, {
            folder: "user/image/",
        });

        const newProduct = new productModel({
            name,
            description,
            price,
            category,
            quantity,
            image:secure_url,
            createdBy:req.user._id
        });

        await newProduct.save();
        res.status(201).json({ message: "تمت إضافة المنتج بنجاح", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
}


export const getAllProduct=async(req , res)=>{
    try{
        const product=await productModel.find();
        return res.status(200).json({message:"succsses", product})

    }catch(error){
        res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
}



export const getProductById=async(req , res)=>{
    try{
        const {id}=req.params
        const product=await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "لم يتم العثور على المنتج" });
        }else{
            return res.status(200).json({message:"succsses", product})
        }

    }catch(error){
        res.status(500).json({ message: `حدث خطأ: ${error.message}` });

    }
}
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await productModel.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "لم يتم العثور على المنتج" });
        }

        res.status(200).json({ message: "تم حذف المنتج بنجاح" });
    } catch (error) {
        res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, quantity } = req.body;

       
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "لم يتم العثور على المنتج" });
        }

        let imageUrl = product.image; 
        if (req.file) {
            const { secure_url } = await cloudenary.uploader.upload(req.file.path, {
                folder: "user/image/",
            });
            imageUrl = secure_url;
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            {
                name: name ?? product.name,
                description: description ?? product.description,
                price: price ?? product.price,
                category: category ?? product.category,
                quantity: quantity ?? product.quantity,
                image: imageUrl
            },
            { new: true }
        );

        return res.status(200).json({ message: "تم تحديث المنتج بنجاح", product: updatedProduct });

    } catch (error) {
        return res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
};
