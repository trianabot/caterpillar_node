const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let superAdminUserModel = new Schema({
    adminId: {
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    contactNumber:{
        type: String,
        required: true
    },
    sysCreatedBy: {
        type: String,
        required: false
    },
    sysUpdatedBy: {
        type: String,
        required: false
    },
    sysCreatedDate: {
        type: String,
        required: false
    },
    sysUpdatedDate: {
        type: String,
        required: false
    },
    passwordResetToken: {
        type:String
    },
    passwordResetExpires: {
        type:Date
    }
});

module.exports = mongoose.model('SuperAdmin',superAdminUserModel);