const { ProductModel } = require("../Mongo/ProductModel");
const { OrderModel } = require('../Mongo/OrderModel');
const { BookingModel } = require("../Mongo/BookingModel");

const HandelOrders = async (req, res) => {
    const session = await OrderModel.startSession();
    session.startTransaction();

    try {
        const userId = req.session.userId; // Assume userId is stored in session
        const { updatedShippingData } = req.body; // items should be an array of { productId, quantity }
        console.log(updatedShippingData.selectedDate);

        // Calculate total amount and update stock
        let totalAmount = 0;

        for (const item of updatedShippingData.products) {
            const product = await ProductModel.findById(item._id).session(session);
            // console.log(product);

            if (!product) {
                return res.status(400).json({ message: 'محصول یافت نشد یا موجودی کافی نیست' });
            }

            // Update product stock
            product.stock -= item.quantity;
            product.sales += item.quantity;
            await product.save({ session });

            // Calculate total amount
            totalAmount += product.price * item.quantity;
        }

        let fee = 0;
        if (updatedShippingData.deliveryfee === 'رایگان') {
            fee = 0;
        } else {
            fee += updatedShippingData.deliveryfee
        }

        // Create the order
        const newOrder = new OrderModel({
            user: req.session.userId, // The user ID from the session
            items: updatedShippingData.products.map(item => ({
                products: item._id, // Product ID from the item
                quantity: item.quantity,   // Quantity from the item
            })),
            totalAmount: totalAmount + fee, // Total cost calculated from the items
            phoneNumber: updatedShippingData.phoneNumber,
            firstName: updatedShippingData.firstName,
            lastName: updatedShippingData.lastName,
            deliveryfee: fee,
            dateAndTime: {
                date: updatedShippingData.selectedDate,
                time: updatedShippingData.selectedTimeSlot,
            },
            shippingAddress: {
                area: updatedShippingData.area,
                neighbourhood: updatedShippingData.neighbourhood,
                street: updatedShippingData.street,
                alleys: updatedShippingData.alleys,
                postalCode: updatedShippingData.postalCode,
                plaque: updatedShippingData.plaque,
            },
        });

        // Save the order in the current session
        await newOrder.save({ session });

        if (updatedShippingData.selectedDate && updatedShippingData.selectedTimeSlot) {
            // Find the booking for the selected date
            let booking = await BookingModel.findOne({ date: updatedShippingData.selectedDate }).session(session);

            if (booking) {
                // Check if the selected time slot exists in the booking timeSlots
                const selectedTimeSlot = updatedShippingData.selectedTimeSlot;

                if (booking.timeSlots[selectedTimeSlot]) {
                    // Check if the current bookings have reached or exceeded the max capacity
                    const currentBookings = booking.timeSlots[selectedTimeSlot].currentBookings;
                    const maxCapacity = booking.timeSlots[selectedTimeSlot].maxCapacity;

                    if (currentBookings >= maxCapacity) {
                        // If the capacity is full, return an error
                        return res.status(400).json({ message: 'زمان انتخابی کاملاً پر است' });
                    }

                    // If the time slot exists and there is capacity, increment the currentBookings
                    booking.timeSlots[selectedTimeSlot].currentBookings += 1;
                    await booking.save({ session });
                } else {
                    // If the time slot doesn't exist, return an error
                    return res.status(400).json({ message: 'زمان انتخابی نامعتبر است' });
                }
            } else {
                // If no booking exists, create a new one for the selected date and time slot
                const newBooking = new BookingModel({
                    date: updatedShippingData.selectedDate,
                    timeSlots: {
                        "9-12": { currentBookings: 0, maxCapacity: 5 },
                        "12-3": { currentBookings: 0, maxCapacity: 5 },
                        "3-6": { currentBookings: 0, maxCapacity: 5 },
                        "6-9": { currentBookings: 0, maxCapacity: 5 },
                    }
                });

                // Check if the time slot is valid
                const selectedTimeSlot = updatedShippingData.selectedTimeSlot;
                if (newBooking.timeSlots[selectedTimeSlot]) {
                    // Check if the currentBookings for the selected time slot is less than maxCapacity
                    if (newBooking.timeSlots[selectedTimeSlot].currentBookings < newBooking.timeSlots[selectedTimeSlot].maxCapacity) {
                        // Increment the currentBookings for the selected time slot
                        newBooking.timeSlots[selectedTimeSlot].currentBookings = 1;
                        await newBooking.save({ session });
                    } else {
                        // If the time slot is already full, return an error
                        return res.status(400).json({ message: 'زمان انتخابی کاملاً پر است' });
                    }
                } else {
                    // If the time slot doesn't exist, return an error
                    return res.status(400).json({ message: 'زمان انتخابی نامعتبر است' });
                }
            }
        }


        await session.commitTransaction(); // Commit if all operations are successful
        res.status(201).json({ message: 'سفارش با موفقیت ایجاد شد', order: newOrder });
    } catch (error) {
        await session.abortTransaction(); // Roll back if there's an error
        console.error(error);
        res.status(500).json({ message: 'خطا در ایجاد سفارش', error: error.message });
    } finally {
        session.endSession(); // End the session
    }
};




const countOrders = async (req, res, next) => {
    try {
        const ordersCount = await OrderModel.countDocuments();
        const pendingOrdersCount = await OrderModel.countDocuments({ status: 'Pending' });
        res.status(200).json({
            message: 'تعداد سفارش‌ها در پایگاه داده',
            counts: {
                ordersCount,
                pendingOrdersCount,
            }
        });
    } catch (error) {
        console.error('خطا در شمارش سفارش‌ها:', error);
        res.status(500).json({
            message: 'خطا در شمارش سفارش‌ها',
            error: error.message, // Include the error message in the response
        });
    }
};


module.exports = { HandelOrders, countOrders }

// await order.save({ session });
// This is used when you want to save a document (like an order) in a MongoDB collection while associating it with the current session.
// By passing the session object to the save method, MongoDB will include this operation in the transaction of that session.
// If any other operation in the session fails, this save will also be rolled back, maintaining data integrity.



// if (updatedShippingData.selectedDate && updatedShippingData.selectedTimeSlot) {
//     // Find the booking for the selected date
//     let booking = await BookingModel.findOne({ date: updatedShippingData.selectedDate }).session(session);
//     if (booking) {
//         // Check if the selected time slot exists in the booking timeSlots
//         const selectedTimeSlot = updatedShippingData.selectedTimeSlot;
//         if (booking.timeSlots[selectedTimeSlot]) {
//             // If the time slot exists, increment the currentBookings for the selected time slot
//             booking.timeSlots[selectedTimeSlot].currentBookings += 1;
//             await booking.save({ session });
//         } else {
//             // If the time slot doesn't exist, return an error
//             return res.status(400).json({ message: 'Invalid time slot selected' });
//         }
//     } else {
//         // If no booking exists, create a new one for the selected date and time slot
//         const newBooking = new BookingModel({
//             date: updatedShippingData.selectedDate,
//             timeSlots: {
//                 "9-12": { currentBookings: 0, maxCapacity: 5 },
//                 "12-3": { currentBookings: 0, maxCapacity: 5 },
//                 "3-6": { currentBookings: 0, maxCapacity: 5 },
//                 "6-9": { currentBookings: 0, maxCapacity: 5 },
//             }
//         });
//         // Check if the time slot is valid
//         const selectedTimeSlot = updatedShippingData.selectedTimeSlot;
//         if (newBooking.timeSlots[selectedTimeSlot]) {
//             // Increment the currentBookings for the selected time slot
//             newBooking.timeSlots[selectedTimeSlot].currentBookings = 1;
//             await newBooking.save({ session });
//         } else {
//             // If the time slot doesn't exist, return an error
//             return res.status(400).json({ message: 'Invalid time slot selected' });
//         }
//     }
// }
