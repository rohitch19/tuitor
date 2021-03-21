const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstname : String,
    lastname : String,
    phone : Number,
    status : String,
    otp : Number,
    expiry : Number
});

module.exports = mongoose.model('User', userSchema);