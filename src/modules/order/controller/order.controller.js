import cartModel from "../../../../DB/models/cart.model.js";
import {userModel} from "../../../../DB/models/user.model.js";
import orderModel from "../../../../DB/models/order.model.js";
import productModel from "../../../../DB/models/product.model.js";
import financialRecordModel from "../../../../DB/models/financialRecordModel.js";
import mongoose from "mongoose";

export const addToCart = async (req, res) => {
    try {
        const { quantity } = req.body; 
        const { productId } = req.params;
        const userId = req.user._id;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "المنتج غير موجود" });
        }

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            cart = new cartModel({ userId, products: [], totalPrice: 0 });
        }

        const existingProductIndex = cart.products.findIndex((item) => item.productId.toString() === productId.toString());
        let newQuantity = quantity;

        if (existingProductIndex > -1) {
            newQuantity = cart.products[existingProductIndex].quantity + quantity;
        }

        
        if (newQuantity > product.quantity) {
            return res.status(400).json({ message: `لا يمكنك إضافة أكثر من ${product.quantity} وحدة من هذا المنتج` });
        }

        if (existingProductIndex > -1) {
            cart.products[existingProductIndex].quantity = newQuantity;
        } else {
            cart.products.push({ productId, quantity });
        }

       // cart.totalPrice = cart.products.reduce((acc, item) => acc + item.quantity * product.price, 0);
       cart.totalPrice = 0;
         for (const item of cart.products) {
         const p = await productModel.findById(item.productId);
        if (p) {
        cart.totalPrice += item.quantity * p.price;
    }
}

        await cart.save();
        res.status(200).json({ message: "تمت إضافة المنتج إلى السلة", cart });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};

         
        export const removeFromCart = async (req, res) => {
            try {
                const { productId } = req.params;
                const userId = req.user.id;
        
                let cart = await cartModel.findOne({ userId });
                if (!cart) {
                    return res.status(404).json({ message: "السلة غير موجودة" });
                }
                const product=await productModel.findById(productId)
        
                cart.products = cart.products.filter((item) => item.productId.toString() !== productId);
        
                cart.totalPrice = cart.products.reduce((acc, item) => acc + item.quantity * product.price, 0);
        
                await cart.save();
                res.status(200).json({ message: "تمت إزالة المنتج من السلة", cart });
            } catch (error) {
                res.status(500).json({ message: `خطأ: ${error.message}` });
            }
        };


        export const getCart = async (req, res) => {
            try {
                const userId = req.user.id;
                const cart = await cartModel.findOne({ userId })
                .populate({
                    path: 'products.productId',
                    populate: {
                        path: 'createdBy',
                        select: 'name email'
                    }
                });
        
                if (!cart) {
                    return res.status(404).json({ message: "السلة فارغة" });
                }
        
                res.status(200).json({ cart });
            } catch (error) {
                res.status(500).json({ message: `خطأ: ${error.message}` });
            }
        };



        export const checkout = async (req, res) => {
            try {
                const userId = req.user._id;
                const cart = await cartModel.findOne({ userId });
        
                if (!cart || cart.products.length === 0) {
                    return res.status(400).json({ message: "السلة فارغة" });
                }
        
                const user = await userModel.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: "المستخدم غير موجود" });
                }
        
               
                if (user.balance < cart.totalPrice) {
                    return res.status(400).json({ message: "الرصيد غير كافٍ لإتمام الشراء" });
                }
                

                for (let item of cart.products) {
                    const product = await productModel.findById(item.productId);
                    if (product) {
                        product.quantity -= item.quantity;
                        if (product.quantity < 0) product.quantity = 0; 
                        await product.save();
                    }
                }
          
                user.balance -= cart.totalPrice;
                await user.save();
        
                
                await financialRecordModel.create({
                    userId,
                    type: "debit", 
                    amount: cart.totalPrice,
                    description: "شراء منتجات",
                    balanceAfterTransaction: user.balance
                });
        
                
                const newOrder = new orderModel({
                    userId,
                    products: cart.products,
                    totalPrice: cart.totalPrice
                });
        
                await newOrder.save();
                await cartModel.findOneAndDelete({ userId });
        
                res.status(200).json({ message: "تم إتمام الطلب بنجاح", order: newOrder, balance: user.balance });
            } catch (error) {
                res.status(500).json({ message: `خطأ: ${error.message}` });
            }
        };
        
        
  export const showAllOrders = async (req, res) => {
    try {
        const marketAgentId = req.user.id; 

     
        const orders = await orderModel.find({})
            .populate({
                path: 'products.productId',
                populate: {
                    path: 'createdBy',
                    select: 'name email'
                }
            });

        
        const filteredOrders = orders.filter(order =>
            order.products.some(p =>
                p.productId?.createdBy?._id.toString() === marketAgentId
            )
        );

        if (filteredOrders.length === 0) {
            return res.status(404).json({ message: "لا توجد طلبات مرتبطة بك" });
        }

        res.status(200).json({ message: "تم عرض الطلبات بنجاح", filteredOrders });
    } catch (error) {
        res.status(500).json({ message: `خطأ في عرض الطلبات: ${error.message}` });
    }
};


export const acceptOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
  
      const order = await orderModel.findById(orderId);
      if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
  
      order.status = "accepted";
      await order.save();
  
      res.status(200).json({ message: "تمت الموافقة على الطلب", order });
    } catch (error) {
      res.status(500).json({ message: `خطأ: ${error.message}` });
    }
  };
  


export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    if (order.status === "rejected") {
      return res.status(400).json({ message: "الطلب مرفوض مسبقًا" });
    }

    if (order.status === "accepted") {
      return res.status(400).json({ message: "لا يمكن رفض طلب تم قبوله مسبقًا" });
    }

    order.status = "rejected";
    await order.save();
    const user = await userModel.findById(order.userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    user.balance += order.totalPrice;
    await user.save();


    await financialRecordModel.create({
      userId: user._id,
      type: "credit",
      amount: order.totalPrice,
      description: `استرجاع مبلغ لطلب مرفوض (Order ID: ${order._id})`,
      balanceAfterTransaction: user.balance
    });

    res.status(200).json({
      message: "تم رفض الطلب وإرجاع المبلغ للمستخدم",
      newBalance: user.balance,
      order
    });
  } catch (error) {
    res.status(500).json({ message: `فشل في رفض الطلب: ${error.message}` });
  }
};

  
export const getAcceptedOrdersByUserIdOrAll = async (req, res) => {
    try {
      const userId = req.user._id;
      const query = { status: 'accepted' };
      let user = null;
  
      if (userId) {
        query.userId = userId;
        user = await userModel.findById(userId).select('-password');
        if (!user) {
          return res.status(404).json({ message: "المستخدم غير موجود" });
        }
      }
  
      const acceptedOrders = await orderModel.find(query).populate({
        path: 'products.productId',
        select: 'name price image', // ✅ أضف الحقول المطلوبة هنا
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      });
  
      if (acceptedOrders.length === 0) {
        return res.status(404).json({ message: userId ? "لا توجد طلبات مقبولة لهذا المستخدم" : "لا توجد طلبات مقبولة" });
      }
  
      res.status(200).json({
        message: userId ? "تم جلب الطلبات المقبولة لهذا المستخدم بنجاح" : "تم جلب كل الطلبات المقبولة بنجاح",
        acceptedOrders,
        ...(user && { user })
      });
    } catch (error) {
      res.status(500).json({ message: `خطأ: ${error.message}` });
    }
  };
  