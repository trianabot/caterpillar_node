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
const CatModel = require('../models/caterpillar.model');


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
    // const collectionName = req.file.originalname.split('.')[0];
    const collectionName = "rawdata";


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
            Collection1.create(jsonObj, function (err, docs) {
                if (err) {
                    console.log(err);
                    res.send({ message: err });
                } else {
                    console.log("inserted");
                    var result = storeinfinal(docs);
                    res.send({ Message: "Data inserted to db" , apiurl : 'http:\/\/' + req.headers.host + '\/file\/' + collectionName.toLowerCase() + 's', result: docs});
                }
            });
        });
}


function processExcel(exceltojson, req, res) {
    try {
        // const collectionName = req.file.originalname.split('.')[0];
        const collectionName = "rawdata";
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
                // console.log(key);
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
            Collection1.create(result, function (err, docs) {
                if (err) {
                    console.log(err);
                    res.send({ message: err });
                } else {
                    console.log("inserted", docs);
                    var result = storeinfinal(docs);
                    res.send({ Message: "Data inserted to db" , apiurl: 'http:\/\/' + req.headers.host + '\/file\/' + collectionName.toLowerCase() + 's', result: result});
                }
            });
        });
    } catch (e) {
        res.json({ error_code: 1, err_desc: "Corrupted excel file" });
    }

    function storeinfinal(docs) {
        var newkeys = ["Enterprise_Spend", "ContractID", "ContractName", "SupplierName", "Sup_PH", "Sup_mail", "Sup_Address", "Sup_City", "Sup_Country",
            "MasterType", "ContractType", "ContractProjectType", "Category", "DeptBU", "CommittedAmount_2018",
            "CommittedAmount_2019", "CurrentAmount_2018", "CurrentAmount_2019", "Spend_2018", "Spend_2019",
            "CommitedSS_rating", "CurrentSS_rating", "CommitedSC_rating", "CurrentSC_rating",
            "CommitedSD_rating", "CurrentSD_rating", "CommitedSavings_rating", "CurrentSavings_rating", "CommitedCV_rating", "CurrentCV_rating", "Enterprises", 
            "CommitedSS_Comment","CurrentSS_Comment", "CommitedSC_Comment", "CurrentSC_Comment", "CommitedSD_Comment", 
            "CurrentSD_Comment", "CommitedSavings_Comment", "CurrentSavings_Comment", "CommitedCV_Comment",
            "CurrentCV_Comment", "date"];
        var refArray = [{ excelkey: "Enterprise_Spend", newKey: "Enterprise_Spend" },
        { excelkey: "ContractID", newKey: "ContractID" },
        { excelkey: "ContractName", newKey: "ContractName" },
        { excelkey: "SupplierName", newKey: "SupplierName" },
        { excelkey: "Sup_PH", newKey: "Sup_PH" },
        { excelkey: "Sup_mail", newKey: "Sup_mail" },
        { excelkey: "Sup_Address", newKey: "Sup_Address" },
        { excelkey: "Sup_City", newKey: "Sup_City" }, { excelkey: "Sup_Country", newKey: "Sup_Country" },
        { excelkey: "MasterType", newKey: "MasterType" }, { excelkey: "ContractType", newKey: "ContractType" },
        { excelkey: "ContractProjectType", newKey: "ContractProjectType" }, { excelkey: "Category", newKey: "Category" },
        { excelkey: "DeptBU", newKey: "DeptBU" }, { excelkey: "CommittedAmount_2018", newKey: "CommittedAmount_2018" },
        { excelkey: "CommittedAmount_2019", newKey: "CommittedAmount_2019" }, { excelkey: "CurrentAmount_2018", newKey: "CurrentAmount_2018" },
        { excelkey: "CurrentAmount_2019", newKey: "CurrentAmount_2019" }, { excelkey: "Spend_2018", newKey: "Spend_2018" },
        { excelkey: "Spend_2019", newKey: "Spend_2019" }, { excelkey: "CommitedSS_rating", newKey: "CommitedSS_rating" },
        { excelkey: "CurrentSS_rating", newKey: "CurrentSS_rating" },
        { excelkey: "CommitedSC_rating", newKey: "CommitedSC_rating" },
        { excelkey: "CurrentSC_rating", newKey: "CurrentSC_rating" },
        { excelkey: "CommitedSD_rating", newKey: "CommitedSD_rating" },
        { excelkey: "CurrentSD_rating", newKey: "CurrentSD_rating" },
        { excelkey: "CommitedSavings_rating", newKey: "CommitedSavings_rating" },
        { excelkey: "CurrentSavings_rating", newKey: "CurrentSavings_rating" },
        { excelkey: "CommitedCV_rating", newKey: "CommitedCV_rating" },
        { excelkey: "CurrentCV_rating", newKey: "CurrentCV_rating" },
        { excelkey: "Enterprises", newKey: "Enterprises" },

        { excelkey: "CommitedSS_Comment", newKey: "CommitedSS_Comment" },
        { excelkey: "CurrentSS_Comment", newKey: "CurrentSS_Comment" },
        { excelkey: "CommitedSC_Comment", newKey: "CommitedSC_Comment" },
        { excelkey: "CurrentSC_Comment", newKey: "CurrentSC_Comment" },
        { excelkey: "CommitedSD_Comment", newKey: "CommitedSD_Comment" },
        { excelkey: "CurrentSD_Comment", newKey: "CurrentSD_Comment" },
        { excelkey: "CommitedSavings_Comment", newKey: "CommitedSavings_Comment" },
        { excelkey: "CurrentSavings_Comment", newKey: "CurrentSavings_Comment" },
        { excelkey: "CommitedCV_Comment", newKey: "CommitedCV_Comment" },
        { excelkey: "CurrentCV_Comment", newKey: "CurrentCV_Comment" },
        { excelkey: "date", newKey: "date" }
        ]
        var obj = newkeys.reduce(function (o, val) { o[val] = null; return o; }, {});
        var final = [];
        var result = [];

        result = docs;
        for (let item of docs) {
            final.push(obj);
        }
        final = final.map(function (el, i) {
            var o = Object.assign({}, el);
            o.uuid = i;
            return o;
        });
        // result = docs;
        result = docs.map(function (el, i) {
            // console.log(el);
            var o = Object.assign({}, el);
            o.uuid = i;
            return o;
        });
        //   res.status(200).send(result);
        final.forEach(function (item) {
            refArray.forEach(function (data) {
                item[data['excelkey']] = result.find(x => x.uuid == item.uuid)['_doc'][data['newKey']];
                // console.log(item[data['newkey']]);
            });
        });
        final = final.map(function (el, i) {
            var o = Object.assign({}, el);
            delete o.uuid
            return o;
          })
        //   final = final.splice(0, 1);

        // return final;
        var final = final.slice(1);
        // var arr = [1, 2, 3, 4]; 
        // arr = arr.shift(); // theRemovedElement == 1
        // console.log(arr);
        // var myarray = ["item 1", "item 2", "item 3", "item 4"];
  
        // console.log(myarray.slice(1));
        if(final.length > 0) {
            CatModel.insertMany(final, (err, docs) => {
                if(!err) {
                    // res.status(200).send({message: 'Saved Succesfully', data: docs})
                    // console.log(docs);
                    return docs;
                }else {
                                    return (err);
                                    // res.send({message:err});
                                }
            });
        }
        // return final
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