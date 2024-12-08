
const checkLogedInForRegister = async (req, res, next) => {
    try {
        if (req.session.userId) {
            return res.status(200).json({
                redirect: '/login'
            })
        }
        next();
    } catch (error) {
        console.log(error);
        next();
    }
}

const checkLogedInForLogin = async (req, res, next) => {
    try {
        if (req.session.userId) {
            return res.status(200).json({
                redirect: '/dashboard'
            })
        }
        next();
    } catch (error) {
        console.log(error);
        next();
    }
}

const checkSession = (req, res) => {
    console.log(req.session.userId);
    if (req.session.userId) { // If user is already logged in
        return res.status(200).json({ loggedIn: true, redirect: '/dashboard', userId: req.session.userId });
    }
    res.status(200).json({ loggedIn: false });
};

module.exports = {
    checkLogedInForRegister,
    checkLogedInForLogin,
    checkSession,
};