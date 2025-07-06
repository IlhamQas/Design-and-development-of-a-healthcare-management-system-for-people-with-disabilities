import { userModel } from "../../../../DB/models/user.model.js";
import cloudinary from "../../../Servicess/cloudenary.js";
import bcrypt from 'bcryptjs' 

export const UdateImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const findUser = await userModel.findById(userId);

    if (!findUser) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const oldImage = findUser.image;

    
    if (oldImage) {
      
      const publicId = oldImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`Users/${publicId}`);
    }

    
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      folder: "Users",
    });

    
    findUser.image = secure_url;
    await findUser.save();

    res.status(200).json({ message: "تم تحديث الصورة بنجاح", image: secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "حدث خطأ أثناء تحديث الصورة" });
  }
};


export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user._id;

    const findUser = await userModel.findById(userId);

    if (!findUser) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    
    const isSamePassword = await bcrypt.compare(newPassword, findUser.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "كلمة المرور الجديدة لا يجب أن تكون نفس القديمة" });
    }

   
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    findUser.password = hashedPassword;
    await findUser.save();

    return res.status(200).json({ message: "تم تحديث كلمة المرور بنجاح" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تحديث كلمة المرور" });
  }
};