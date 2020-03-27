const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let qualityModel = new Schema({
    projectId:{
        type:String,
        required:true
    },
    invoiceId:{
        type:String,
        required:true
    },
    invoiceDate:{
        type:Date
    },
    weightage:{
        type:Number
    },
    rating:{
        type:Number
    },
    addRating:[
        {
            inputBy:String,
            inputFor:String,
            people:Number,
            peopleRating:Number,
            peopleComment:String,
            quality:Number,
            qualityRating:Number,
            qualityComment:String,
            velocity:Number,
            velocityRating:Number,
            velocityComment:String,
            cost:Number,
            costRating:Number,
            costComment:String
        }
    ]
});

module.exports = mongoose.model('quality', qualityModel);