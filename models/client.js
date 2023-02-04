const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    folder: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;