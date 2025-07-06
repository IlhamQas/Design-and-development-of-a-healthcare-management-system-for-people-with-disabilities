import postModel from "../../../../DB/models/post.model.js";
import { userModel } from "../../../../DB/models/user.model.js";
import cloudenary from "../../../Servicess/cloudenary.js";

export const AddPost = async (req, res) => {
    const { id } = req.params;
    const { doctorName, DateOfPost, postDesc } = req.body;

    try {
    
        const findDoctor = await userModel.findOne({ name: doctorName });
        if (!findDoctor) {
            return res.status(404).json({ message: "الطبيب غير موجود" });
        }

        
        const findUserId = await userModel.findById(id);
        if (!findUserId) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

    
        if (!req.file) {
            return res.status(400).json({ message: "الصورة مطلوبة" });
        }

        const cloudResult = await cloudenary.uploader.upload(req.file.path, {
            folder: 'posts',
            resource_type: 'auto'
        });

     
        const newPost = new postModel({
            doctorName,
            DateOfPost,
            postDesc,
            photo: cloudResult.secure_url,
            userId: findUserId._id
        });

        await newPost.save();

        return res.status(201).json({ message: "تمت إضافة المنشور بنجاح", post: newPost });
    } catch (error) {
        return res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
};


export const AddPostForAllUsers = async (req, res) => {
    const { doctorName, DateOfPost, postDesc } = req.body;

    try {
        const findDoctor = await userModel.findOne({ name: doctorName });
        if (!findDoctor) {
            return res.status(404).json({ message: "الطبيب غير موجود" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "الصورة مطلوبة" });
        }

        const cloudResult = await cloudenary.uploader.upload(req.file.path, {
            folder: 'posts'
        });

       
        const guardians = await userModel.find({ role: "guardian" });

        if (guardians.length === 0) {
            return res.status(404).json({ message: "لا يوجد أولياء أمور (guardians)" });
        }

      
        const posts = await Promise.all(
            guardians.map(async (user) => {
                const newPost = new postModel({
                    doctorName,
                    DateOfPost,
                    postDesc,
                    photo: cloudResult.secure_url,
                    userId: user._id
                });
                return newPost.save();
            })
        );

        return res.status(201).json({ message: "تمت إضافة المنشورات لجميع أولياء الأمور", posts });
    } catch (error) {
        return res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
};



export const getAllPosts = async (req, res) => {
    try {
        const posts = await postModel
            .find()
            .sort({ createdAt: -1 }) 
            .populate('userId', 'name email image'); 

        if (posts.length === 0) {
            return res.status(404).json({ message: "لا توجد منشورات" });
        }

        return res.status(200).json({ message: "جميع المنشورات", posts });
    } catch (error) {
        return res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
};



export const getUserPosts = async (req, res) => {
    const { id } = req.params;

    try {
        const posts = await postModel.find({ userId: id })
          .populate('userId', 'name email image')
          .sort({ DateOfPost: -1 }); 

        if (posts.length === 0) {
            return res.status(404).json({ message: "لا توجد منشورات لهذا المستخدم" });
        }

        return res.status(200).json({ message: "منشورات المستخدم", posts });
    } catch (error) {
        return res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
};


export const deletePost = async (req, res) => {
    const { id } = req.params; 

    try {
        const deletedPost = await postModel.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ message: "المنشور غير موجود" });
        }

        return res.status(200).json({ message: "تم حذف المنشور بنجاح", deletedPost });
    } catch (error) {
        return res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
};



export const updatePost = async (req, res) => {
    const { id } = req.params; 
    const { doctorName, DateOfPost, postDesc } = req.body;

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: "المنشور غير موجود" });
        }

      
        if (req.file) {
            const cloudResult = await cloudenary.uploader.upload(req.file.path, {
                folder: 'posts',
                resource_type: 'auto'
            });
            post.photo = cloudResult.secure_url;
        }

 
        if (doctorName) post.doctorName = doctorName;
        if (DateOfPost) post.DateOfPost = DateOfPost;
        if (postDesc) post.postDesc = postDesc;

        await post.save();

        return res.status(200).json({ message: "تم تحديث المنشور بنجاح", post });
    } catch (error) {
        return res.status(500).json({ message: `حدث خطأ: ${error.message}` });
    }
};
