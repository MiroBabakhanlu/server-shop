// require('dotenv').config()
// const mongoose = require('mongoose')
// mongoose.connect(process.env.DB_URI)
//     .then(res => {
//         console.log('DB connected');
//     })
//     .catch(err => {
//         console.log(err);
//     })
const mongoose = require('mongoose');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectWithRetry() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('DB connected');
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
        console.log('Retrying in 5 seconds...');
        await delay(5000);  // Retry after 5 seconds
        await connectWithRetry();  // Recursively call to retry the connection
    }
}

connectWithRetry();
