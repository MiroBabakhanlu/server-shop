// const HandelLogout = async (req, res, next) => {
//     req.session.destroy((err) => {
//         if (err) {
//             return res.stats(500).json({ message: 'Failed to log out. Please try again.' })
//         }
//         res.clearCookie('connect.sid', { path: '/', maxAge: 0 });
//         return res.status(200).json({ message: 'Logout successful.', redirect: '/login' });
//     });
// }

// module.exports = HandelLogout

// const HandelLogout = async (req, res, next) => {
//     req.session.destroy((err) => {
//         if (err) {
//             return res.status(500).json({ message: 'Failed to log out. Please try again.' });
//         }

//         // Clear the session cookie
//         res.clearCookie('connect.sid', { path: '/', maxAge: 0 });

//         // If you have a CSRF token cookie, you should clear it as well
//         res.clearCookie('_csrf', { path: '/', maxAge: 0 });

//         return res.status(200).json({ message: 'Logout successful.', redirect: '/login' });
//     });
// }

// module.exports = HandelLogout;

const HandelLogout = async (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'خروج ناموفق. لطفاً دوباره تلاش کنید.' });
        }

        res.clearCookie('connect.sid', { path: '/' });
        res.clearCookie('_csrf', { path: '/' });

        return res.status(200).json({ message: 'خروج با موفقیت انجام شد.', redirect: '/login' });
    });
}

module.exports = HandelLogout;
