const { UserModel } = require("../Mongo/UserModel");
// const UserModel = require("../Mongo/UserModel");

const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(403).json({ loggedIn: false, message: 'دسترسی ممنوع است. لطفاً وارد شوید.', redirect: '/login' });
    }
    next();
};


const checkRole = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'کاربر یافت نشد.' });
        }
        req.userRole = user.role;
        next();
    } catch (error) {
        console.error('Error checking role:', error);
        return res.status(500).json({ message: 'خطای سرور. لطفاً بعداً دوباره تلاش کنید.' });
    }
};

const getDashboard = async (req, res) => {
    const role = req.userRole;

    if (role === 'admin') {
        return res.status(200).json({ message: 'به داشبورد ادمین خوش آمدید', role });
    } else if (role === 'customer') {
        return res.status(200).json({ message: 'به داشبورد مشتری خوش آمدید', role });
    } else {
        return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
};


module.exports = {
    getDashboard,
    checkRole,
    checkAuth
};