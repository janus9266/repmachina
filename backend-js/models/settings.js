const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    user_id: { type: String, required: true},
    client_id: { type: String },
    client_secret: { type: String },
    jwt_token: { type: String },
    user_name: { type: String },
    password: { type: String },
    device_id: { type: String }
})

module.exports = mongoose.model('Setting', SettingSchema);