const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let usecasemodel = new Schema({
    industry:{
        type: String
    },
    usecase:[{type: String}]
});



module.exports = mongoose.model('usecases',usecasemodel);