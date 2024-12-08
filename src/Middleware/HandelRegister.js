// const UserModel = require("../Mongo/UserModel");
const bcrypt = require('bcrypt');
const { UserModel } = require('../Mongo/UserModel');

const HandelRegister = async (req, res, next) => {
    console.log(req.body);

    try {

        const { name, phone, password } = req.body;
        console.log(req.body);

        // Check inputs
        if (!name || !phone || !password) {
            return res.status(400).json({
                message: 'تمام فیلدها الزامی است'
            });
        }
        // Check if user already exists
        const doesExist = await UserModel.findOne({ $or: [{ name }, { phone }] });
        if (doesExist) {
            return res.status(409).json({
                message: 'نام کاربری یا شماره قبلاً ثبت شده است.'
            });
        }
        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new UserModel({
            name,
            // email,
            phone,
            password: hashedPassword,
        });
        await newUser.save();

        res.status(201).json({
            message: 'ثبت‌نام با موفقیت انجام شد',
            redirect: '/login'
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'خطای داخلی سرور'
        });
        next(error);
    }
};

module.exports = HandelRegister;
