const locslStrategy = require('passport-local').Strategy;
const Client = require('../models/client');

async function initialize(passport) {
    const authenticateUser = async (name, password, done) => {
        const client = await Client.findOne({ name: name })
        if (client == null) {
            return done(null, false, { message: 'No user with that name' })
        }
        try {
            if (client.password === password) {
                return done(null, client)
            } else {
                return done(null, false, { message: 'Password incorrect' })
            }
        }
        catch (err) {
            return done(err)
        }
    }

    passport.use(new locslStrategy({ usernameField: 'name' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        const client = await Client.findById(id)
        if (client) {
            return done(null, client)
        } else {
            return done(null, false, { message: 'No user with that name' })
        }
    });
}

module.exports = initialize;