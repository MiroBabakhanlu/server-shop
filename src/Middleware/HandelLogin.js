// const UserModel = require("../Mongo/UserModel");
const bcrypt = require('bcrypt')
const { UserModel } = require('../Mongo/UserModel')

const HandelLogin = async (req, res, next) => {

    const { name, password } = req.body

    try {
        if (!name || !password) {
            return res.status(400).json({
                message: 'تمامی فیلدها الزامی هستند',
            })
        }
        //check if exist
        const user = await UserModel.findOne({ name })
        if (!user) {
            return res.status(401).json({
                message: 'نام کاربری یا رمز عبور نامعتبر است',
            })
        }
        //compae password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({
                message: 'نام کاربری یا رمز عبور نامعتبر است',
            })
        }
        //login
        if (isMatch) {
            req.session.userId = user._id
        }
        console.log("Session userId set to:", req.session.userId);
        res.status(200).json({
            message: 'در حال ورود، لطفاً صبر کنید',
            redirect: '/dashboard'
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'خطای داخلی سرور'
        });
        next(error);
    }

}
module.exports = HandelLogin