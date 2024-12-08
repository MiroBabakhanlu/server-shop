const { model, Schema } = require('mongoose');

const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        products: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    totalAmount: { type: Number, required: true },//total cost
    status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
    createdAt: { type: Date, default: Date.now },
    phoneNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    deliveryfee: { type: String, required: true },
    dateAndTime: {
        date: { type: Date, required: true},
        time: { type: String, required: true },
    },
    shippingAddress: {
        area: { type: String, required: true },
        neighbourhood: { type: String, required: true },
        street: { type: String, required: true },
        alleys: { type: String, required: true },
        postalCode: { type: String, required: true },
        plaque: { type: String, required: true },
    },
}, { timestamps: true });

const OrderModel = model('Order', OrderSchema);

module.exports = {
    OrderModel
};