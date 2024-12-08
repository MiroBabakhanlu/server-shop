//imports
const HandelRegister = require('./src/Middleware/HandelRegister.js');
const { checkLogedInForRegister, checkLogedInForLogin, checkSession } = require('./src/Auth/Redirects.js');
const HandelLogin = require('./src/Middleware/HandelLogin.js');
const { checkAuth, checkRole, getDashboard } = require('./src/Middleware/HandelDashboard.js');
const HandelLogout = require('./src/Middleware/HandelLogout.js');
const { checkAuthAdmin, restock } = require('./src/Middleware/HandelRestock.js');
const { GetProducts } = require('./src/Middleware/GetProducts.js');
const { HandelUpdateProducts } = require('./src/Middleware/HandelUpdateProducts.js');
const { handleDeleteProduct } = require('./src/Middleware/DeleteProducts.js');
const { countUsers } = require('./src/Mongo/UserModel.js');
const { countProducts, ProductModel } = require('./src/Mongo/ProductModel.js');
const { HandelOrders, countOrders } = require('./src/Middleware/HandelOrders.js');
const { GetUserInfo } = require('./src/Middleware/GetUserInfo.js')

const changePassword = require('./src/Middleware/changePassword.js');
const changePhone = require('./src/Middleware/changePhone.js');
const { checkingCapacity } = require('./src/Middleware/Booking/CheckingCapacity.js');
const GetOrders = require('./src/Middleware/GetOrders.js');
const { ChangeOrderStatus } = require('./src/Middleware/ChangeOrderStatus.js');
const { GetSalesDetails } = require('./src/Middleware/GetSalesDetails.js');
const { GetCustomerOrders } = require('./src/Middleware/GetCustomerOrders.js');
const rateLimit = require('express-rate-limit');
const RateLimitMongo = require("rate-limit-mongo");
const MongoStore = require('connect-mongo');
const csrf = require('csurf');
const cookieParser = require('cookie-parser')


//basic imports
require('dotenv').config()
const express = require('express');
const app = express();
//JSON PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//db connection
require('./src/Mongo/DbConnection.js');
//session config
const session = require('express-session');
app.use(session({
    secret: process.env.SECRET,
    store: MongoStore.create({ mongoUrl: process.env.DB_URI }),
    cookie: {
        maxAge: Number(process.env.COOKIE_MAXAGE),
        secure: process.env.NODE_ENV === 'production',
        httpOnly: process.env.NODE_ENV === 'production',
    },
    resave: false,
    saveUninitialized: false,
}))


//rate limiting

const apiLimiter = rateLimit({
    store: new RateLimitMongo({
        uri: process.env.DB_URI,
        expireTimeMs: process.env.EXPIRE_TIME_MS // 15 minutes expiration
    }),
    windowMs: process.env.WINDOWS_MS, // 15 min window
    max: process.env.MAX_API_REQ, // limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        message: 'Too many requests, please try again after 15 minutes.'
    },
    headers: true,
});
app.use('/api/', apiLimiter);


//helmet config
const helmet = require('helmet')
app.use(helmet());

//cors
const cors = require('cors');
app.use(cors({
    origin: process.env.REQ_ORIGIN,
    // origin: '*',
    // allowedHeaders: ['Content-Type', 'csrf-token', 'Authorization'],
    credentials: true
}))

// CSRF protection middleware
app.use(cookieParser());

const csrfProtection = csrf();
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie('_csrf', csrfToken, {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: process.env.NODE_ENV === 'production',
        maxAge: Number(process.env.COOKIE_MAXAGE),
    });

    res.json({ csrfToken });
});

//cloudinary 
const cloudinary = require('cloudinary').v2
const multer = require('multer');
const { uploadAndUpdateImage } = require('./src/Middleware/UploadAndEdit.js');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

//routes//


//post
app.post('/api/register', HandelRegister);
app.post('/api/login', csrfProtection, HandelLogin)
app.post('/api/logout', csrfProtection, HandelLogout);
app.post('/api/admin-restock', csrfProtection, checkAuth, checkAuthAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;
        if (!req.file || !name || !price || !description || !stock) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // Stream the image buffer to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image', transformation: [{ width: 350, height: 350, crop: 'fill', gravity: 'auto' }, {
                    quality: 'auto',
                    fetch_format: 'auto'
                },]
            },
            async (error, result) => {
                if (error) {
                    console.error('Error uploading image to Cloudinary:', error);
                    return res.status(500).json({ message: 'Image upload failed.' });
                }
                // Get the secure URL of the uploaded image
                // Get the secure URL of the uploaded image
                const img_url = result.secure_url;
                // Call the restock function to create the product
                await restock(req, res, img_url);
            }
        );
        // End the stream with the file buffer
        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Error in /api/admin-restock:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
app.post('/api/add-order', checkAuth, HandelOrders)


//patch


app.patch('/api/update-products/:id', csrfProtection, checkAuth, checkAuthAdmin, upload.single('image'), uploadAndUpdateImage, (req, res) => {
    // Respond with the updated product
    return res.status(200).json(req.updatedProduct); // Send back the updated product
});
app.patch('/api/change-password', csrfProtection, checkAuth, changePassword)
app.patch('/api/change-phone', csrfProtection, checkAuth, changePhone)
app.patch('/api/change-order-status', csrfProtection, checkAuth, checkAuthAdmin, ChangeOrderStatus)


//delete
app.delete('/api/delete-product/:id', csrfProtection, handleDeleteProduct);


//gets
app.get('/api/get-products', GetProducts);
app.get('/api/get-orders', checkAuth, checkAuthAdmin, GetOrders);
app.get('/api/get-curstomer-orders', checkAuth, GetCustomerOrders);
app.get('/api/dashboard', checkAuth, checkRole, getDashboard)
app.get('/api/check-session', checkSession)
app.get('/api/get-usercount', checkAuthAdmin, countUsers)
app.get('/api/get-productcount', checkAuthAdmin, countProducts)
app.get('/api/get-orderscount', checkAuthAdmin, countOrders)
app.get('/api/get-sales-info', checkAuth, checkAuthAdmin, GetSalesDetails)
app.get('/api/cdash', checkAuth, GetUserInfo)
app.get('/api/check-date-capacity', checkAuth, checkingCapacity)







const { port } = require('./liara.json')


app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
});
app.listen(port, () => {
    console.log('server is on');
})


// app.use(csrfProtection);

// app.use((req, res, next) => {
//     const csrfToken = req.csrfToken(); // Get the CSRF token generated by the csrf middleware
//     console.log('Generated CSRF Token:', csrfToken); // Log the token
//     next();
// });

// app.use((req, res, next) => {
//     console.log('CSRF Token in header:', req.headers['csrf-token']); // or req.headers['x-csrf-token']
//     next();
// });

// const csrfProtection = csrf({
//     cookie: true,
//     secure: false,
//     httpOnly: false,
//     maxAge: Number(process.env.COOKIE_MAXAGE),
// });