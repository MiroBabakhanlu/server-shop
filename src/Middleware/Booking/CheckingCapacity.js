const { BookingModel } = require("../../Mongo/BookingModel")

const checkingCapacity = async (req, res) => {
    const { date } = req.query;
    console.log(date);

    try {
        // Check if the requested date exists in the database
        let booking = await BookingModel.findOne({ date }).lean();
        console.log(booking);
        // console.log(booking.toLocaleDateString('fa-IR', { weekday: 'short', month: 'short', day: 'numeric' }));

        // If the date isn't found, return a 404 with a message
        if (!booking) {
            const availability = {
                "9-12": "available",
                "12-3": "available",
                "3-6": "available",
                "6-9": "available"
            };
            console.log(availability);
            return res.status(200).json(availability);
        }



        const availability = {};
        for (const slot in booking.timeSlots) {
            availability[slot] = booking.timeSlots[slot].currentBookings < booking.timeSlots[slot].maxCapacity
                ? "available"
                : "full";
        }

        // Return the availability with a 200 status code

        return res.status(200).json(availability);
    } catch (error) {
        // If there's a server-side error, return a 500 status code with the error message
        console.error(error);
        return res.status(500).json({
            message: "خطایی هنگام بررسی موجودی رخ داده است",
            error: error.message,
        });
    }
}

module.exports = {
    checkingCapacity
}


// if (!booking) {
//     const timeSlots = ["9-12", "12-3", "3-6", "6-9"];
//     const randomStatus = () => (Math.random() > 0.5 ? "available" : "full");

//     const availability = timeSlots.reduce((acc, slot) => {
//         acc[slot] = randomStatus();
//         return acc;
//     }, {});

//     console.log(availability);
//     return res.status(200).json(availability);
// }

// Map each slot to either "available" or "full"