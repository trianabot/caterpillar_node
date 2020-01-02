const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let caterpillarModel = new Schema({
    ContractID: {
        type: String
    },
    ContractName: {
        type: String
    },
    SupplierName: {
        type: String
    },
    Sup_PH: {
        type: String
    },
    Sup_mail: {
        type: String
    },
    Sup_Address: {
        type: String
    },
    Sup_City: {
        type: String
    },
    Sup_Country: {
        type: String
    },
    MasterType: {
        type: String
    },
    ContractType: {
        type: String
    },
    ContractProjectType: {
        type: String
    },
    Category: {
        type: String
    },
    DeptBU: {
        type: String
    },
    CommittedAmount_2018: {
        type: String
    },
    CommittedAmount_2019: {
        type: String
    },
    CurrentAmount_2018: {
        type: String
    },
    CurrentAmount_2019: {
        type: String
    },
    Spend_2018: {
        type: String
    },
    Spend_2019: {
        type: String
    },
    CommitedSS_rating: {
        type: Number
    },
    CurrentSS_rating: {
        type: Number
    },
    CommitedSC_rating: {
        type: Number
    },
    CurrentSC_rating: {
        type: Number
    },
    CommitedSD_rating: {
        type: Number
    },
    CurrentSD_rating: {
        type: Number
    },
    CommitedSavings_rating: {
        type: Number
    },
    CurrentSavings_rating: {
        type: Number
    },
    CommitedCV_rating: {
        type: Number
    },
    CurrentCV_rating: {
        type: Number
    }
});



module.exports = mongoose.model('caterpillar', caterpillarModel);