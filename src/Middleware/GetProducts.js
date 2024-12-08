const { ProductModel } = require("../Mongo/ProductModel");
// const ProductModel = require("../mongo/ProductModel")


const GetProducts = async (req, res, next) => {
    try {

        const products = await ProductModel.find();
        return res.status(200).json(products);

    } catch (error) {
        console.error("خطا در دریافت محصولات:", error);
        return res.status(500).json({ message: "خطای داخلی سرور" });
    }
}

module.exports = {
    GetProducts
}