import financialRecordModel from "../../../../DB/models/financialRecordModel.js";
import { userModel } from "../../../../DB/models/user.model.js";



export const addCredit = async (req, res) => {
    try {
       const {id}=req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "يجب إدخال مبلغ صحيح" });
        }

        const user = await userModel.findById(id);

      
    
        user.balance += Number(amount);
        await user.save();

        
        await financialRecordModel.create({
            userId: id,
            type: "credit",
            amount: Number(amount),
            description: "إيداع رصيد",
            balanceAfterTransaction: user.balance
        });
        

        res.status(200).json({ message: "تمت إضافة الرصيد بنجاح", balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};


export const deleteCredit=async(req,res)=>{
    try{
        const {id}=req.params;
        const {amount}=req.body
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "يجب إدخال مبلغ صحيح" });
        }
        const user=await userModel.findById(id);
        user.balance-=amount;
        await user.save()
        await financialRecordModel.create({
            id,
            type: "credit",
            amount,
            description: "سحب ",
            balanceAfterTransaction: user.balance
        })
        res.status(200).json({ message: "تمت ازالة الرصيد بنجاح", balance: user.balance });
    }catch(error){
        res.status(500).json({ message: `خطأ: ${error.message}` });

    }
}


export const findAll=async(req,res)=>{
    try{
        const find=await financialRecordModel.find({});
        return res.status(200).json({message:"succsses", find})

    }catch(error){
        res.status(500).json({ message: `خطأ: ${error.message}` });

    }
}


export const getFinancialRecords = async (req, res) => {
    try {
        const userId =  req.query.id ||req.user._id  ;

      
        const records = await financialRecordModel.find({userId:userId  });
  

       
        if (!records.length) {
            return res.status(404).json({ message: "لا توجد عمليات مالية لهذا المستخدم." });
        }

        res.status(200).json({ records });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};