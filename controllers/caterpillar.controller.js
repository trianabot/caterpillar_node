const TenantRegisterModel = require('../models/tenantregister.model');
const UserRegisterModel = require('../models/userregister.model');
const SuperAdminModel = require('../models/superadmin.model');
const LoginInfoModel = require('../models/logininfo.model');
const TokenGenModel = require('../models/tokengen.model');
const usecasemodel = require('../models/usecase.model');
const randomstring = require('randomstring');
const nodemailer = require("nodemailer");
const uuid = require('uuid4');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const passport = require('passport');

const CatModel = require('../models/caterpillar.model');

exports.testuser = (req, res) => {
    res.send('this is test cat data');
}

exports.postCatOverview = (req, res) => {
    console.log(req.body);
    CatModel.insertMany(req.body, (err, docs) => {
        if(!err) {
            res.status(200).send({message: 'Saved Succesfully', data: docs})
        }else {
                            return next(err);
                            // res.send({message:err});
                        }
    });
}

exports.getCatOverviewSpend = (req, res) => {
    // console.log(req.params.type);
    
    var type = req.params.type;
    var amounttype;
    if(type == 'CommittedAmount_2019') {
         amounttype = 'CommittedAmount_2018';
    }else if(type == 'CurrentAmount_2019') {
        amounttype = 'CurrentAmount_2018';
    }
    var supp = [];
    var suppliernames = [];
    CatModel.find({}, (err, docs) => {

        if (!err) {
            // const docss = suppliers_spend(docs, type);
            // console.log(docs)
            supp = docs.reduce(function(a, d) {
                if (a.indexOf(d.SupplierName) === -1) {
                    a.push(d.SupplierName);
                }
                return a;
            }, []);
            const process = processdata(docs, supp, type);
            // console.log(process)
            const docss = suppliers_spend(process, type);
            let intersection = process.filter(x => !docss.includes(x));
            var othercount = 0;
            var otherprevious = 0;
            var othercommitedrating;
            var othercurrentrating;
            for (let item of intersection) {
                othercount = othercount + parseInt(item['y']);
                otherprevious = otherprevious + parseInt(item['previous']);
                othercommitedrating = parseInt(item['commitedrating']);
                othercurrentrating = parseInt(item['currentrating'])
            }
            docss.push({"name": "Others", "y": othercount, previous: otherprevious, commitedrating: othercommitedrating, currentrating: othercurrentrating})
            for(let item of docss) {
                suppliernames.push(item['SupplierName']);
            }
            res.status(200).send({data: docss, suppliers: supp});
        } else {
            return next(err);
            // res.send({message:err});
        }

    });
    function suppliers_spend(supp, type) {
        // if(type == 'Spend_2019') {
        //     const getValue = ({ Spend_2019 }) => +Spend_2019.slice(1) || 0;
        //     docs.sort((a, b) => getValue(a) - getValue(b));
        //     docs = docs.slice(0, 10);
        //     return docs;
        // }else if(type == 'Spend_2018') {
        //     const getValue = ({ Spend_2018 }) => +Spend_2018.slice(1) || 0;
        //     docs.sort((a, b) => getValue(a) - getValue(b));
        //     docs = docs.slice(0, 10);
        //     return docs;
        // }
        // const getValue = ({ value }) => +value.slice(1) || 0;
            supp.sort((a, b) => b.y - a.y);
            supp = supp.slice(0, 10);
            return supp;
    }

    function processdata(docs, supp, type) {
        var processvalue = [];
        var value = 0;
        var previous = 0;
        var commitedrating;
        var currentrating;
        for(let item of supp) {
            value = 0;
            previous = 0;
            for(let items of docs) {
                if(item == items['SupplierName']) {
                    value = value + parseInt(items[type]);
                    previous = previous + parseInt(items[amounttype]);
                    commitedrating = parseInt(items['CommitedSS_rating']);
                    currentrating = parseInt(items['CurrentSS_rating']);
                }
            }
            processvalue.push({name: item, y: value, previous: previous, commitedrating: commitedrating, currentrating: currentrating});
        }
        return processvalue;
    }
}

    exports.getSpendByCategory = (req, res) => {
        var type = req.params.type;
        var amounttype;
        if (type == 'CommittedAmount_2019') {
            amounttype = 'CommittedAmount_2018';
        } else if (type == 'CurrentAmount_2019') {
            amounttype = 'CurrentAmount_2018';
        }
        var categories = []
        CatModel.find({}, (err, docs) => {

            if (!err) {
                categories = docs.reduce(function(a, d) {
                    if (a.indexOf(d.Category) === -1) {
                        a.push(d.Category);
                    }
                    return a;
                }, []);
                const category = processdata(docs, categories, type);
                // const spendcategory = spendCategory(category, docs, type);
                // let intersection = docs.filter(x => !category.includes(x));
                res.status(200).send({ data: category.slice(0,10), categories: categories.slice(0,10)});
            } else {
                return next(err);
                // res.send({message:err});
            }

        });
        function processdata(docs, supp, type) {
            var processvalue = [];
            var value = 0;
            var previous = 0;
            var commitedrating;
            var currentrating;
            for(let item of supp) {
                value = 0;
                previous = 0;
                commitedrating = 0;
                currentrating = 0;
                for(let items of docs) {
                    if(item == items['Category']) {
                        value = value + parseInt(items[type]);
                        previous = previous + parseInt(items[amounttype]);
                        commitedrating = parseInt(items['CommitedSC_rating']);
                        currentrating = parseInt(items['CurrentSC_rating']);
                    }
                }
                processvalue.push({name: item, y: value, previous: previous, commitedrating: commitedrating, currentrating: currentrating});
            }
            return processvalue;
        }
}

exports.getSpendByDept = (req, res) => {
    var type = req.params.type;
    var amounttype;
        if (type == 'CommittedAmount_2019') {
            amounttype = 'CommittedAmount_2018';
        } else if (type == 'CurrentAmount_2019') {
            amounttype = 'CurrentAmount_2018';
        }
    var deptBu = [];
    CatModel.find({}, (err, docs) => {

        if (!err) {
            deptBu = docs.reduce(function(a, d) {
                if (a.indexOf(d.DeptBU) === -1) {
                    a.push(d.DeptBU);
                }
                return a;
            }, []);
            const deptbu = processdata(docs, deptBu, type);
            // let intersection = docs.filter(x => !category.includes(x));
            res.status(200).send({ data: deptbu, dept: deptBu});
        } else {
            return next(err);
            // res.send({message:err});
        }

    });
    function processdata(docs, supp, type) {
        var processvalue = [];
        var value = 0; 
        var previous = 0;
        var commitedrating;
        var currentrating;
        for(let item of supp) {
            value = 0;
            previous = 0;
            for(let items of docs) {
                if(item == items['DeptBU']) {
                    value = value + parseInt(items[type]);
                    previous = previous + parseInt(items[amounttype]);
                    commitedrating = parseInt(items['CommitedSD_rating']);
                    currentrating = parseInt(items['CurrentSD_rating']);
                }
            }
            processvalue.push({name: item, y: value, previous: previous, commitedrating: commitedrating, currentrating: currentrating});
        }
        return processvalue;
    }

}
    exports.getSupplierSavings = (req, res) => {
        // console.log(req.params.type);
        var type = req.params.type;
        var amounttype;
        if (type == 'CommittedAmount_2019') {
            amounttype = 'CommittedAmount_2018';
        } else if (type == 'CurrentAmount_2018') {
            amounttype = 'CurrentAmount_2019';
        }
        var suppliername = [];
        var spend2018others = 0;
        var spend2019others = 0;
        var suppliersaving = [];
        CatModel.find({}, (err, docs) => {
    
            if (!err) {
                suppliername = docs.reduce(function(a, d) {
                    if (a.indexOf(d.SupplierName) === -1) {
                        a.push(d.SupplierName);
                    }
                    return a;
                }, []);
                suppliername = suppliername.slice(0,10);
                const docss = suppliers_savings(docs, suppliername, type);
                const sorteddata = processsort(docss);
                let intersection = sorteddata.filter(x => !docss.includes(x));
                var othercount = 0;
                for (let item of intersection) {
                    othercount = othercount + parseInt(item['value']);
                }
                sorteddata.push({"name": "Others", "value": othercount})
                res.status(200).send({ data: sorteddata, suppliers: suppliername });
            } else {
                return next(err);
                // res.send({message:err});
            }
    
        });
        function processsort(savingdocs) {
            savingdocs.sort((a,b)=>b.y - a.y);
            savingdocs = savingdocs.slice(0,10);
            return savingdocs;
        }
        function suppliers_savings(docsss, suppliername, type) {
            var commited;
            var current;
            var colorcodes = ['#7cc0f7', '#ff4b4c', '#070fb0', '#1769a3', '#1aa8a9', '#ffac4e', '#03cb44', '#ff6b1b', '#a42cee', '#ff4d6f'];
            if(type == 'CommittedAmount_2019') {
                  commited = 'CommittedAmount_2019';
                  current = 'CurrentAmount_2019'
            }else if(type == 'CurrentAmount_2018') {
                commited = 'CommittedAmount_2018';
                current = 'CurrentAmount_2018'
            }
            
             for(let item of suppliername) {
                var spend2018 = 0;
                var spend2019 = 0;
                var savings = 0;
                 for(let items of docsss) {
                     if(items['SupplierName'] == item) {
                          spend2018 = spend2018 + parseInt(items[commited]);
                          spend2019 = spend2019 + parseInt(items[current]);
                     }
                 }
                 savings = spend2019 - spend2018;
                 suppliersaving.push({name: item, value: savings, color:''});
             }

             for(var i=0; i<suppliersaving.length; i++) {
                 for(var j=0; j<colorcodes.length; j++) {
                     suppliersaving[i]['color'] = colorcodes[i];
                 }
             }
             return suppliersaving;
        }
    }

    exports.contractbyvalue = (req, res) => {
        var type = req.params.type;
        var contracts = [];
        var othervalue = 0;
        var otherprevious = 0;
        var othercolor;
        var othery;
        var otherCOrating;
        var otherCUrating
        CatModel.find({}, (err, docs) => {
    
            if (!err) {
                // const docss = contractvalue(docs, type);
                contracts = docs.reduce(function(a, d) {
                    if (a.indexOf(d.ContractName) === -1) {
                        a.push(d.ContractName);
                    }
                    return a;
                }, []);
                const process = processdata(docs, contracts, type);
                const sortedvalue = sorteddata(process);
                // contracts = contracts.slice(0,10);
                let intersection = process.filter(x => !sortedvalue.includes(x));
                
                for(let item of intersection) {
                    othervalue = othervalue + parseInt(item['value']);
                    otherprevious = otherprevious+ parseInt(item['previous']);
                    othercolor = item['color'];
                    otherCOrating = item['commitedrating'];
                    otherCUrating = item['currentrating'];
                }
                sortedvalue.push({name:'other', value: othervalue, color: othercolor, previous: otherprevious , y: othery, commitedrating: otherCOrating, currentrating: otherCUrating});

                // console.log('process',sortedvalue);
                res.status(200).send({ data: sortedvalue, contracts: contracts.slice(0,10)});
            } else {
                return next(err);
                // res.send({message:err});
            }
    
        });
        function sorteddata(records) {
            records.sort((a, b) => b.y - a.y);
            records = records.slice(0, 10);
            return records;
        }

        function contractvalue(docs, type) {
            if(type == 'Spend_2019') {
                const getValue = ({ Spend_2019 }) => +Spend_2019.slice(1) || 0;
                docs.sort((a, b) => getValue(a) - getValue(b));
                docs = docs.slice(0, 10);
                return docs;
            }else if(type == 'Spend_2018') {
                const getValue = ({ Spend_2018 }) => +Spend_2018.slice(1) || 0;
                docs.sort((a, b) => getValue(a) - getValue(b));
                docs = docs.slice(0, 10);
                return docs;
            }
        }

        function processdata(docs, contracts, type) {
            var commited;
            var colorcodes = ['#7cc0f7', '#ff4b4c', '#070fb0', '#1769a3', '#1aa8a9', '#ffac4e', '#03cb44', '#ff6b1b', '#a42cee', '#ff4d6f'];
            if(type == 'CommittedAmount_2019') {
                  commited = 'CommittedAmount_2018';
            }else if(type == 'CurrentAmount_2019') {
                commited = 'CurrentAmount_2018';
            }
                var processvalue = [];
                var value = 0;
                var previous = 0;
                var commitedrating;
                var currentrating;
                for(let item of contracts) {
                    value = 0;
                    previous = 0;
                    for(let items of docs) {
                        if(item == items['ContractName']) {
                            value = value + parseInt(items[type]);
                            previous = previous + parseInt(items[commited]);
                            commitedrating = parseInt(items['CommitedCV_rating']);
                            currentrating = parseInt(items['CurrentCV_rating']);
                        }
                    }
                    processvalue.push({name: item, value: value, color: '', previous: previous, y: value, commitedrating: commitedrating, currentrating: currentrating});
                }
                for(var i=0; i<processvalue.length; i++) {
                    for(var j=0; j<colorcodes.length; j++) {
                        processvalue[i]['color'] = colorcodes[i];
                    }
                }
                return processvalue;
        }
    }

    exports.totalVendorsContracts = (req,res) => {
        var contracts = [];
        var vendors = [];
        CatModel.find({}, (err, docs) => {
    
            if (!err) {
                // const docss = contractvalue(docs, type);
                contracts = docs.reduce(function(a, d) {
                    if (a.indexOf(d.ContractName) === -1) {
                        a.push(d.ContractName);
                    }
                    return a;
                }, []);

                vendors = docs.reduce(function(a, d) {
                    if (a.indexOf(d.SupplierName) === -1) {
                        a.push(d.SupplierName);
                    }
                    return a;
                }, []);

                res.status(200).send({ vendors: vendors.length, contracts: contracts.length });
            } else {
                return next(err);
                // res.send({message:err});
            }
    
        });
    }

    exports.digitalsavings = (req,res) => {
        var type = req.params.type;
        CatModel.find({}, (err, docs) => {
    
            if (!err) {
                var goal = [];
                var actual = [];
                for(let item of docs) {
                    goal.push(parseInt(item['CommittedAmount_2019']));
                    actual.push(parseInt(item['CurrentAmount_2019']));
                }
                goal = goal.slice(0,100);
                actual = actual.slice(0, 100);
                res.status(200).send({goal: goal, actual: actual});
            }else {
                return next(err);
                // res.send({message:err});
            }
        });
    }

    exports.postSSrating = (req,res) => {
        console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ SupplierName: req.body.name }, { CommitedSS_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    // console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else {
            CatModel.updateMany({ SupplierName: req.body.name }, { CurrentSS_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    // console.log('else',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }
        
    }

    exports.postSCrating = (req,res) => {
        // console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ Category: req.body.name }, { CommitedSC_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    // console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else {
            CatModel.updateMany({ Category: req.body.name }, { CurrentSC_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    // console.log('else',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }
        
    }

    exports.postSDrating = (req,res) => {
        // console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ DeptBU: req.body.name }, { CommitedSD_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    // console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else {
            CatModel.updateMany({ DeptBU: req.body.name }, { CurrentSD_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    // console.log('else',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }
        
    }

    exports.postCVrating = (req,res) => {
        // console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ ContractName: req.body.name }, { CommitedCV_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    // console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else {
            CatModel.updateMany({ ContractName: req.body.name }, { CurrentCV_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    // console.log('else',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }
        
    }

    exports.supplierfilters = (req,res) => {
        var suppliers = [];
          CatModel.find({}, (err, docs) => {
              if(!err) {
                suppliers = docs.reduce(function(a, d) {
                    if (a.indexOf(d.SupplierName) === -1) {
                        a.push(d.SupplierName);
                    }
                    return a;
                }, []);
                res.status(200).send({data: suppliers})
              }
          })
    }