const { ProductModel } = require("../mongo/ProductModel");
// const ProductModel = require("../mongo/ProductModel");

const handleDeleteProduct = async (req, res) => {
    const { id } = req.params; // Get product id from URL params
    console.log('Product ID:', id);
    try {
        const deletedProduct = await ProductModel.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "محصول یافت نشد." });
        }
        return res.status(200).json({ message: "محصول با موفقیت حذف شد." });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "خطای داخلی سرور." });
    }
};

module.exports = {
    handleDeleteProduct,
};