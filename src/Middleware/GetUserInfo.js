const { UserModel } = require("../Mongo/UserModel");


const GetUserInfo = async (req, res, next) => {
    console.log('Session userId:', req.session.userId); // Add this line for debugging


    try {
        const userId = req.session.userId;
        const user = await UserModel.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'کاربر یافت نشد.' });
        }
        console.log(user.createdAt); // Log it to check if it's a valid ISO date string or Date object.

        return res.status(200).json({
            data: {
                username: user.name,
                // email: user.email,
                phone: user.phone,
                timeCreated: user.createdAt
            },
            message: 'اطلاعات کاربر با موفقیت دریافت شد.'
        })
    } catch (error) {
        console.error("خطا در دریافت اطلاعات کاربر:", error);
        res.status(500).json({ message: 'خطای داخلی سرور.' });
    }

}

module.exports = {
    GetUserInfo
}
