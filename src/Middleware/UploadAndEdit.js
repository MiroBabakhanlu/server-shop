// const cloudinary = require('cloudinary').v2;
// const { ProductModel } = require("../mongo/ProductModel");

// // Middleware to upload image and update the product
// const uploadAndUpdateImage = async (req, res, next) => {
//     try {
//         const { id } = req.params; // Get product ID from URL params
//         const { name, price, description, stock } = req.body; // Destructure required fields

//         // Check if all fields are provided
//         if (!req.file || !name || !price || !description || !stock) {
//             return res.status(400).json({ message: 'All fields are required.' });
//         }

//         // Stream the image buffer to Cloudinary
//         const uploadStream = cloudinary.uploader.upload_stream(
//             {
//                 resource_type: 'image',
//                 transformation: [{ width: 350, height: 350, crop: 'fill', gravity: 'auto' }, {
//                     quality: 'auto',
//                     fetch_format: 'auto'
//                 },]
//             },
//             async (error, result) => {
//                 if (error) {
//                     console.error('Error uploading image to Cloudinary:', error);
//                     return res.status(500).json({ message: 'Image upload failed.' });
//                 }

//                 // Get the secure URL of the uploaded image
//                 const img_url = result.secure_url;

//                 // Prepare the updates
//                 const updates = {
//                     name,
//                     price: Number(price), // Ensure price is a number
//                     description,
//                     stock: Number(stock), // Ensure stock is a number
//                     imageUrl: img_url, // Add image URL to updates
//                 };

//                 // Update the product in the database
//                 const updatedProduct = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
//                 if (!updatedProduct) {
//                     return res.status(404).json({ message: "Product not found." });
//                 }

//                 // Set the updated product to the response object
//                 req.updatedProduct = updatedProduct; // Store the updated product
//                 next(); // Proceed to the next middleware/route handler
//             }
//         );

//         // End the stream with the file buffer
//         uploadStream.end(req.file.buffer);
//     } catch (error) {
//         console.error('Error in uploadAndUpdateImage middleware:', error);
//         return res.status(500).json({ message: 'Internal server error.' });
//     }
// };

// module.exports = { uploadAndUpdateImage };

const cloudinary = require('cloudinary').v2;
const { ProductModel } = require("../Mongo/ProductModel");

// Middleware to upload image and update the product
const uploadAndUpdateImage = async (req, res, next) => {
    try {
        const { id } = req.params; // Get product ID from URL params
        const { name, price, description, stock } = req.body; // Destructure required fields

        // Check if required fields are provided (excluding image)
        if (!name || !price || !description || !stock) {
            return res.status(400).json({ message: 'تمامی فیلدها الزامی هستند به جز تصویر.' });
        }

        // Prepare the updates object
        const updates = {
            name,
            price: Number(price), // Ensure price is a number
            description,
            stock: Number(stock), // Ensure stock is a number
        };

        // If an image is uploaded, handle the upload and include the image URL in the updates
        if (req.file) {
            // Stream the image buffer to Cloudinary
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    transformation: [{ width: 350, height: 350, crop: 'fill', gravity: 'auto' }, {
                        quality: 'auto',
                        fetch_format: 'auto'
                    }],
                },
                async (error, result) => {
                    if (error) {
                        console.error('خطا در بارگذاری تصویر به Cloudinary:', error);
                        return res.status(500).json({ message: 'بارگذاری تصویر ناموفق بود.' });
                    }

                    // Get the secure URL of the uploaded image
                    const img_url = result.secure_url;

                    // Add image URL to updates
                    updates.imageUrl = img_url;

                    // Update the product in the database
                    const updatedProduct = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
                    if (!updatedProduct) {
                        return res.status(404).json({ message: "محصول یافت نشد." });
                    }

                    // Set the updated product to the response object
                    req.updatedProduct = updatedProduct; // Store the updated product
                    next(); // Proceed to the next middleware/route handler
                }
            );

            // End the stream with the file buffer
            uploadStream.end(req.file.buffer);
        } else {
            // If no image is uploaded, update the product without the image URL
            const updatedProduct = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
            if (!updatedProduct) {
                return res.status(404).json({ message: "محصول یافت نشد." });
            }

            // Set the updated product to the response object
            req.updatedProduct = updatedProduct; // Store the updated product
            next(); // Proceed to the next middleware/route handler
        }
    } catch (error) {
        console.error('خطا در میانه‌رو uploadAndUpdateImage:', error);
        return res.status(500).json({ message: 'خطای داخلی سرور.' });
    }
};

module.exports = { uploadAndUpdateImage };