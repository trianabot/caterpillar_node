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
    }
});



module.exports = mongoose.model('caterpillar', caterpillarModel);