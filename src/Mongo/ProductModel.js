const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    imageUrl: {
        type: String, // URL for product image
    },
    sales: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true


});

// const ProductModel = mongoose.model('Product', productSchema);
const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);

// module.exports = ProductModel;



const countProducts = async (req, res, next) => {
    try {
        const productsCount = await ProductModel.countDocuments();
        console.log(productsCount);
        res.status(200).json({
            message: 'Total products in the database',
            productsCount, // Returning user count directly
        });
    } catch (error) {
        console.error('Error counting products:', error);
        res.status(500).json({
            message: 'Error counting products',
            error: error.message, // Include the error message in the response
        });
    }
};

module.exports = {
    ProductModel,
    countProducts,
};
