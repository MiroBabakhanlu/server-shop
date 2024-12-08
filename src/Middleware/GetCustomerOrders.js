const { OrderModel } = require("../Mongo/OrderModel");

const GetCustomerOrders = async (req, res) => {
    try {
        // Ensure the user is logged in and the userId is available
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'کاربر وارد سیستم نشده است.' });
        }

        // Fetch orders for the user with selected fields
        const orders = await OrderModel.find({ user: userId }, {
            dateAndTime: 1,
            deliveryfee: 1,
            items: 1,
            shippingAddress: 1,
            status: 1,
            totalAmount: 1,
        })
            .populate('items.products', 'name price') // Populate product name and price if needed
            .sort({ createdAt: -1 }); // Sort by the most recent orders

        // Return the fetched orders
        res.status(200).json({ orders });
    } catch (error) {
        console.error('خطا در دریافت سفارش‌ها:', error.message);
        res.status(500).json({ error: 'امکان دریافت سفارش‌ها وجود ندارد.' });
    }
}

module.exports = { GetCustomerOrders }