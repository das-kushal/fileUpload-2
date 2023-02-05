const passport = require('passport');

function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    res.redirect('/login');
}

function isNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
}

module.exports = { isAuth, isNotAuth };