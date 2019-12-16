const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LoginInfoModel = new Schema({
    userName:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    userId:{
        type:String,
        required:true
    },
    emailId:{
        type: String,
        required: true 
    },
    password:{
        type: String,
        required: true
    },
    OTI:{
        type: String,
        required: true
    },
    organizationCategory:{
        type: String
    },
    industriesUsecase:[{type: String}],
    wrongAttempts:{
        type: String,
        required: false
    },
    isVerified:{
        type: Boolean,
        default: true
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


module.exports = mongoose.model('LoginInfo',LoginInfoModel);