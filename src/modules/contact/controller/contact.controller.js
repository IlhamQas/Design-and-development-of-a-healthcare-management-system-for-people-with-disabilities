import contactModel from "../../../../DB/models/Contact.model.js";

export const addLocation=async(req , res)=>{
    const {name , email , location}=req.body;
    try{
     const add=await contactModel.create(req.body);
     if(!add){
        return res.status(400).json({message:"خطا في الاضافة "})
     }else{
        return res.status(200).json({message:"تمت الاضافة ",add})

     }
    }catch(error){
        return res.status(500).json({message:"error", error})
    }
}


export const deleteLocation=async(req,res)=>{
    const {id}=req.params;
    try{
        const findLoc=await contactModel.findById(id);
if(findLoc){
    const deleteLoc=await contactModel.findByIdAndDelete(id);
    res.json("تم الحذف بنجاح")
}else{
    res.json("مش موجود")
}

    }catch(error){
        return res.status(500).json({message:"error", error})

    }
}


export const findAll=async(req , res)=>{
    try{
        const find=await contactModel.find({});
        if(!find){
            res.json("مش موجود")  
        }else{
            res.json({message:"succsses", find})
        }

    }catch(error){
        return res.status(500).json({message:"error", error})

    }
}


export const findById=async(req , res)=>{
    const {id}=req.params;
    try{
        const find=await contactModel.findById(id);
        if(!find){
            res.json("مش موجود")  
        }else{
            res.json({message:"succsses", find})
        }

    }catch(error){
        return res.status(500).json({message:"error", error})

    }
}