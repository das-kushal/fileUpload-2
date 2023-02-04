const passport = require('passport');

function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    res.status(401).render('errorMessage', { error: 'Unauthorized' })
}

module.exports = { isAuth };