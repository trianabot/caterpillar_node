const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;


let userRegistrationSchema = new Schema({
    clientId: {
        type: String,
        required: true
    },
    userId: {
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
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    industries: [{ type: String,required: true}],
    industriesUsecase: [{
        industryName: { type: String },
        industriesUsecase: [{
            type: String,
        }]
    }],
    organizationCategory: [{type: String}],
    OTI: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    alternateEmail: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required:true
    },
    designation: {
        type: String,
        required: true
    },
    location: {
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
    }
});

userRegistrationSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User',userRegistrationSchema);