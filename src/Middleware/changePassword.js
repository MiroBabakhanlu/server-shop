const { UserModel } = require("../Mongo/UserModel");
const bcrypt = require('bcrypt')

const changePassword = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'هر دو رمز عبور فعلی و جدید الزامی هستند' });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'کاربر پیدا نشد' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'رمز عبور فعلی اشتباه است' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: 'رمز عبور با موفقیت تغییر یافت' });
    } catch (error) {
        console.error('Error in changePassword:', error);
        return res.status(500).json({ message: 'خطای سرور' });
    }
};

module.exports = changePassword;
