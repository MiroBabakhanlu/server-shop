// const { OrderModel } = require("../Mongo/OrderModel");

// const GetOrders = async (req, res, next) => {
//     try {
//         const orders = await OrderModel.find()
//             .populate('user', 'name email') // Populate 'user' field with 'name' and 'email'
//             .populate('items.products', 'name price'); // Populate 'products' with 'name' and 'price'

//         // Simplify the orders to show user and their orders
//         const userOrders = orders.map(order => ({
//             orderId: order._id,
//             user: {
//                 name: order.user.name,
//                 email: order.user.email,
//                 phoneNumber: order.phoneNumber,
//                 firstName: order.firstName,
//                 lastName: order.lastName,
//             },
//             status: order.status,
//             address: order.shippingAddress,
//             dateAndTime: order.dateAndTime,
//             orderedProducts: order.items.map(item => ({
//                 productName: item.products.name,
//                 productPrice: item.products.price,
//                 quantity: item.quantity,
//             })),
//         }));

//         // Log each user's order
//         // console.log('User Orders:', JSON.stringify(userOrders, null, 2));

//         return res.status(200).json(userOrders); // Send the user orders as a response
//     } catch (error) {
//         console.error('Error fetching orders:', error.message);
//         res.status(500).json({ error: 'Unable to fetch orders' });
//     }
// }

// module.exports = GetOrders;

const { OrderModel } = require("../Mongo/OrderModel");

const GetOrders = async (req, res, next) => {
    try {
        const orders = await OrderModel.find()
            .populate('user', 'name email') // Populate 'user' field with 'name' and 'email'
            .populate('items.products', 'name price'); // Populate 'products' with 'name' and 'price'

        // Check if there are no orders
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'هیچ سفارشی یافت نشد.' });
        }

        // Simplify the orders to show user and their orders
        const userOrders = orders.map(order => ({
            orderId: order._id,
            user: {
                name: order.user?.name || 'Unknown',
                email: order.user?.email || 'Unknown',
                phoneNumber: order.phoneNumber || 'N/A',
                firstName: order.firstName || 'N/A',
                lastName: order.lastName || 'N/A',
            },
            status: order.status || 'Pending',
            address: order.shippingAddress || 'N/A',
            dateAndTime: order.dateAndTime || 'N/A',
            orderedProducts: order.items.map(item => ({
                productName: item.products?.name || 'Unknown',
                productPrice: item.products?.price || 0,
                quantity: item.quantity || 0,
            })),
        }));

        // Send the user orders as a response
        return res.status(200).json(userOrders);
    } catch (error) {
        console.error('خطا در دریافت سفارش‌ها:', error.message);
        return res.status(500).json({ error: 'امکان دریافت سفارش‌ها وجود ندارد.' });
    }
}

module.exports = GetOrders;
