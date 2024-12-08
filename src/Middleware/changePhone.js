const { UserModel } = require("../Mongo/UserModel");

const changePhone = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { newPhone } = req.body;

        if (!newPhone) {
            return res.status(400).json({ message: 'شماره تماس جدید الزامی است' });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'کاربر پیدا نشد' });
        }

        // Update the phone number
        user.phone = newPhone;
        await user.save();

        return res.status(200).json({ message: 'شماره تماس با موفقیت تغییر یافت' });
    } catch (error) {
        console.error('Error in changePhone:', error);
        return res.status(500).json({ message: 'خطای سرور' });
    }
};

module.exports = changePhone;
