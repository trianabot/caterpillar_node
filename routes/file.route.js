const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
// const csv = require("fast-csv");
const csv = require('csvtojson')
const fs = require('fs');
const xlstojson = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var store = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});


var upload = multer({ storage: store }).single('file');

router.post('/upload', (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(501).json({ error: err });
        }
        if (!req.file) {
            res.json({ error_code: 1, Message: "No file passed" });
            return;
        }
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
            processExcel(exceltojson, req, res);
        } else if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xls') {
            exceltojson = xlstojson;
            processExcel(exceltojson, req, res);
        } else {
            processCsv(req, res);
        }
        //do all database record saving activity
        // return res.json({originalname:req.file.originalname, uploadname:req.file.filename});
    });
});

function processCsv(req, res) {

    const csvfile = req.file.path;
    const collectionName = req.file.originalname.split('.')[0];


    csv()
        .fromFile(csvfile)
        .then((jsonObj) => {
           
            var setarr = jsonObj.slice(0);
            var sample = setarr[0];
            for (var key in sample) {
                if (sample.hasOwnProperty(key)) {
                    sample[key] = {}
                }
            }

            let sampleSchema = new Schema(sample);
            // let Collection1 = null;

            try {
                Collection1 = mongoose.model(collectionName, sampleSchema);
            } catch (e) {
                Collection1 = mongoose.model(collectionName);
            }
            console.log(jsonObj);
            Collection1.create(jsonObj, function (err) {
                if (err) {
                    console.log(err);
                    res.send({ message: err });
                } else {
                    console.log("inserted");
                    res.send({ Message: "Data inserted to db" , apiurl : 'http:\/\/' + req.headers.host + '\/file\/' + collectionName.toLowerCase() + 's'});
                }
            });
        });
}


function processExcel(exceltojson, req, res) {
    try {
        const collectionName = req.file.originalname.split('.')[0];
        exceltojson({
            input: req.file.path,
            output: null, //since we don't need output.json
        }, function (err, result) {
            if (err) {
                return res.json({ error_code: 1, message: err, data: null });
            }
            // res.json({error_code:0,message:"Data inserted", data: result});
            var setarr = result.slice();
            var sample = setarr[0];
            for (var key in sample) {
                if (sample.hasOwnProperty(key)) {
                    sample[key] = {}
                }
            }

            const sampleSchema = new Schema(sample);
            // let Collection1 = null;

            try {
                Collection1 = mongoose.model(collectionName, sampleSchema);
            } catch (e) {
                Collection1 = mongoose.model(collectionName);
            }
            Collection1.create(result, function (err) {
                if (err) {
                    console.log(err);
                    res.send({ message: err });
                } else {
                    console.log("inserted");
                    res.send({ Message: "Data inserted to db" , apiurl: 'http:\/\/' + req.headers.host + '\/file\/' + collectionName.toLowerCase() + 's'});
                }
            });
        });
    } catch (e) {
        res.json({ error_code: 1, err_desc: "Corrsupted excel file" });
    }
}


// router.post("/upload",  multer({dest: "./uploads/"}).array("uploads", 12), function (req, res) {
//     console.log('files', req.files);
//     res.send(req.files);
// });


router.post('/download', (req, res, next) => {
    filepath = path.join(__dirname, '../uploads') + '/' + req.body.filename;
    res.sendFile(filepath);
});

router.get('/:filename',(req,res,next) => {
    const file = req.params.filename;
    // res.send(req.headers.host+file);
    mongoose.connection.db.collection(file , (err,collection) => {
        console.log(file)
        // console.log(collection.find({}));
        if(err){
            res.send({message:err});
        }else {
            collection.find({},{ _id: 0}).toArray(function(err, data){
                if(err){
                    res.send({message:err})
                }else{
                    res.send(data);
                }
            });
        }
        // res.send(collection);
    })
});

module.exports = router;