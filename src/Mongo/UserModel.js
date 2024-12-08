const { model, Schema } = require('mongoose');

const UserSchema = new Schema({
    name: { type: String, required: true },
    // email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        default: 'customer'
    },
}, { timestamps: true })

const UserModel = model('User', UserSchema);

// module.exports = UserModel;

// Function to count users
const countUsers = async (req, res, next) => {
    try {
        const userCount = await UserModel.countDocuments();
        res.status(200).json({
            message: 'Total users in the database',
            userCount, // Returning user count directly
        });
    } catch (error) {
        console.error('Error counting users:', error);
        res.status(500).json({
            message: 'Error counting users',
            error: error.message, // Include the error message in the response
        });
    }
};


// Call the function
module.exports = {
    UserModel,
    countUsers,
};