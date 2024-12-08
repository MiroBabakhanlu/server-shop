// const ProductModel = require("../mongo/ProductModel");
// const UserModel = require("../Mongo/UserModel");
const { ProductModel } = require("../mongo/ProductModel");
const { UserModel } = require("../Mongo/UserModel");


const checkAuthAdmin = async (req, res, next) => {
    try {
        // Find the user in the database
        const userId = req.session.userId;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'کاربر یافت نشد.' });
        }
        console.log(user);
        // Check if the user has the 'admin' role
        console.log(user.role);

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'دسترسی غیرمجاز' });
        }
        // User is authenticated as an admin, proceed to the next middleware
        next();
    } catch (error) {
        console.error('Error checking admin role:', error);
        return res.status(500).json({ message: 'خطای سرور. لطفاً بعداً دوباره تلاش کنید.' });
    }
};

const restock = async (req, res, img_url) => {
    try {
        const { name, price, description, stock } = req.body;
        // const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        if (!name || !price || !description || !stock || !img_url) {
            return res.status(400).json({ message: 'تمامی فیلدها الزامی هستند.' });
        }

        const existingProduct = await ProductModel.findOne({ $or: [{ name }, { description }] }); // check if product exist


        if (existingProduct) { //if yes
            return res.status(409).json({ message: 'محصول قبلاً موجود است.' });
        }

        const newProduct = new ProductModel({
            name,
            price,
            description,
            stock,
            imageUrl: img_url
        })

        await newProduct.save();
        res.status(201).json({ message: 'محصول جدید با موفقیت ایجاد شد' });


    } catch (error) {
        console.error('خطا در بازسازی موجودی:', error);
        return res.status(500).json({ message: "خطای داخلی سرور" });
    }
}

module.exports = {
    checkAuthAdmin,
    restock,
};
