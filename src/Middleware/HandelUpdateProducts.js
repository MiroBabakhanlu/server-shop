const { ProductModel } = require("../mongo/ProductModel");
// const ProductModel = require("../mongo/ProductModel");

const HandelUpdateProducts = async (req, res, imageUpdates = {}) => {
    console.log(req.body);

    const { name, price, description, stock } = req.body;
    const { id } = req.params; // Get product ID from URL params

    // Construct updates object
    const updates = {
        name,
        price,
        description,
        stock,
        ...(imageUpdates.img_url && { image: imageUpdates.img_url }) // Add image URL if exists
    };

    try {
        const existingProduct = await ProductModel.findOne({ $or: [{ name }] }); // Check if product exists

        if (existingProduct) {
            return res.status(409).json({ message: 'محصول قبلاً موجود است.' });
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "محصول یافت نشد." });
        }

        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "خطای داخلی سرور." });
    }
};

module.exports = {
    HandelUpdateProducts,
};

//So, updatedProduct will contain only the single product that was updated, with the new changes applied, not all products.




// app.patch('/api/update-products/:id', checkAuthAdmin, upload.single('image'), async (req, res) => {
//     try {
//         const { name, price, description, stock } = req.body;
//         const { id } = req.params; // get product id from URL params

//         // Create the updates object
//         const updates = {
//             name,
//             price,
//             description,
//             stock,
//         };

//         let img_url; // Variable to hold the image URL

//         // Check if an image was uploaded
//         if (req.file) {
//             // Stream the image buffer to Cloudinary
//             const uploadStream = cloudinary.uploader.upload_stream(
//                 {
//                     resource_type: 'image',
//                     transformation: [{ width: 350, height: 350, crop: 'fill', gravity: 'auto' }]
//                 },
//                 async (error, result) => {
//                     if (error) {
//                         console.error('Error uploading image to Cloudinary:', error);
//                         return res.status(500).json({ message: 'Image upload failed.' });
//                     }
//                     img_url = result.secure_url; // Get the secure URL of the uploaded image
//                     console.log('Uploaded image URL:', img_url); // Debugging output

//                     // Now update the updates object with the new image URL
//                     updates.imageUrl = img_url;

//                     // Update the product
//                     const updatedProduct = await ProductModel.findByIdAndUpdate(id, updates, { new: true });

//                     if (!updatedProduct) {
//                         return res.status(404).json({ message: "Product not found." });
//                     }

//                     return res.status(200).json(updatedProduct);
//                 }
//             );
//             // End the stream with the file buffer
//             uploadStream.end(req.file.buffer);
//         } else {
//             // If no image, just update without changing the image URL
//             const updatedProduct = await ProductModel.findByIdAndUpdate(id, updates, { new: true });

//             if (!updatedProduct) {
//                 return res.status(404).json({ message: "Product not found." });
//             }

//             return res.status(200).json(updatedProduct);
//         }
//     } catch (error) {
//         console.error('Error in /api/update-products:', error);
//         return res.status(500).json({ message: 'Internal server error.' });
//     }
// });
