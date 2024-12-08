const { Schema, model } = require('mongoose')

const BookingSchema = new Schema({
    date: { type: Date, required: true },
    // date: { type: String, required: true},
    timeSlots: {
        "9-12": { currentBookings: { type: Number, default: 0 }, maxCapacity: { type: Number, default: 5 } },
        "12-3": { currentBookings: { type: Number, default: 0 }, maxCapacity: { type: Number, default: 5 } },
        "3-6": { currentBookings: { type: Number, default: 0 }, maxCapacity: { type: Number, default: 5 } },
        "6-9": { currentBookings: { type: Number, default: 0 }, maxCapacity: { type: Number, default: 5 } }
    }
})

const BookingModel = model('booking', BookingSchema);

module.exports = {
    BookingModel
}