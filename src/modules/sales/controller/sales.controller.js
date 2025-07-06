import orderModel from "../../../../DB/models/order.model.js";


export const getTotalSales = async (req, res) => {
    try {
        const totalSales = await orderModel.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
        ]);

        res.status(200).json({ totalRevenue: totalSales[0]?.totalRevenue || 0 });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};


export const getTopSellingProducts = async (req, res) => {
    try {
        const topProducts = await orderModel.aggregate([
            { $unwind: "$products" }, 
            { 
                $group: { 
                    _id: "$products.productId",
                    totalSold: { $sum: "$products.quantity" }
                }
            },
            { $sort: { totalSold: -1 } }, 
            { $limit: 5 }, 
            { 
                $lookup: { 
                    from: "products", 
                    localField: "_id", 
                    foreignField: "_id", 
                    as: "productDetails" 
                }
            },
            { $unwind: "$productDetails" } 
        ]);

        res.status(200).json({ topProducts });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};
export const getMonthlyRevenue = async (req, res) => {
    try {
        const monthlyRevenue = await orderModel.aggregate([
            { 
                $group: { 
                    _id: { 
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } } 
        ]);

        res.status(200).json({ monthlyRevenue });
    } catch (error) {
        res.status(500).json({ message: `خطأ: ${error.message}` });
    }
};
