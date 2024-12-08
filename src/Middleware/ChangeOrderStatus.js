const { OrderModel } = require("../Mongo/OrderModel");

const ChangeOrderStatus = async (req, res, next) => {

    const { newStatus, orderId } = req.body;
    // Validate input
    if (!newStatus || !orderId) {
        return res.status(400).json({
            message: 'وضعیت جدید و شناسه سفارش الزامی است',
        });
    }
    try {
        const order = await OrderModel.findById(orderId)
        if (!order) {
            return res.status(400).json({
                message: 'سفارش پیدا نشد'
            })
        }

        if (order.status === newStatus) {
            return res.status(400).json({
                message: 'وضعیت سفارش نمی‌تواند به همان حالت قبلی تغییر کند'
            })
        }

        order.status = newStatus;
        const updatedOrder = await order.save();

        // Format the updated order
        const formattedOrder = {
            orderId: updatedOrder._id,
            user: {
                name: updatedOrder.user.name,
                email: updatedOrder.user.email,
                phoneNumber: updatedOrder.phoneNumber,
                firstName: updatedOrder.firstName,
                lastName: updatedOrder.lastName,
            },
            status: updatedOrder.status,
            address: updatedOrder.shippingAddress,
            dateAndTime: updatedOrder.dateAndTime,
            orderedProducts: updatedOrder.items.map(item => ({
                productName: item.products.name,
                productPrice: item.products.price,
                quantity: item.quantity,
            })),
        };


        return res.status(200).json({
            message: `وضعیت سفارش به ${newStatus} تغییر یافت`,
            order: formattedOrder,
        })

    } catch (error) {
        console.error('خطا در تغییر وضعیت سفارش:', error.message);
        res.status(500).json({
            message: 'هنگام به‌روزرسانی وضعیت سفارش خطایی رخ داد. لطفاً دوباره تلاش کنید.',
        });
    }

}

module.exports = { ChangeOrderStatus }