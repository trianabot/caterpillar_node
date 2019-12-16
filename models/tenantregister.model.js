const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

var securityQuestionsSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
})

let tenantRegistrationSchema = new Schema({
    superAdminId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true,
    },
    role:{
        type: String,
        required: true
    },
    organizationName : {
        type: String,
        required: true,
    },
    organizationCategory: [{type: String}],
    OTI: {
        type: String
    },
    industries: [{ type: String,required: true}],
    industriesUsecase: [{
        industryName: { type: String },
        industriesUsecase: [{
            type: String,
        }]
    }],
    adminName: {
        type: String,
        required: true
    },
    adminRole: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    alternativeEmailId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    securityQuestions: [ securityQuestionsSchema ],
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

tenantRegistrationSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Tenant', tenantRegistrationSchema);
