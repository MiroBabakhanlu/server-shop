const { ProductModel } = require("../Mongo/ProductModel");


const GetSalesDetails = async (req, res) => {
    try {
        // Find the product with the highest sales
        const mostSoldProduct = await ProductModel.findOne().sort({ sales: -1 }).limit(1);

        // Calculate total sales (sum of all sales across products)
        const totalSales = await ProductModel.aggregate([
            { $group: { _id: null, totalSales: { $sum: "$sales" } } }
        ]);

        // Calculate total profit as the sum of (price * sales) for all products
        const totalNetProfit = await ProductModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalProfit: { $sum: { $multiply: ["$price", "$sales"] } },
                },
            },
        ]);

        // Prepare the response
        const result = {
            mostSoldProduct,
            totalSales: totalSales[0] ? totalSales[0].totalSales : 0,
            totalNetProfit: totalNetProfit[0] ? totalNetProfit[0].totalProfit : 0,
        };

        res.status(200).json({
            message: 'اطلاعات سفارش شما با موفقیت ارسال شد.',
            salesInfo: result
        })


        return result;
    } catch (error) {
        console.error('خطا در دریافت جزئیات فروش:', error);
        throw error;
    }
};

module.exports = { GetSalesDetails };
