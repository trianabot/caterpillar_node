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

var moment = require('moment'); 

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
            var othercolor;
            for (let item of intersection) {
                othercount = othercount + parseInt(item['y']);
                otherprevious = otherprevious + parseInt(item['previous']);
                othercommitedrating = parseInt(item['commitedrating']);
                othercurrentrating = parseInt(item['currentrating']);
                othercolor = item['color'];
            }
            docss.push({"name": "Others", "y": othercount, previous: otherprevious, commitedrating: othercommitedrating, currentrating: othercurrentrating, color: othercolor})
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
        var colorcodes = ['#7cc0f7', '#ff4b4c', '#070fb0', '#1769a3', '#1aa8a9', '#ffac4e', '#03cb44', '#ff6b1b', '#a42cee', '#ff4d6f'];
        var value = 0;
        var previous = 0;
        var commitedrating;
        var currentrating;
        var comment;
        for(let item of supp) {
            value = 0;
            previous = 0;
            for(let items of docs) {
                if(item == items['SupplierName']) {
                    value = value + parseInt(items[type]);
                    previous = previous + parseInt(items[amounttype]);
                    commitedrating = parseInt(items['CommitedSS_rating']);
                    currentrating = parseInt(items['CurrentSS_rating']);
                    comment = items['CommitedSS_Comment']
                }
            }
            processvalue.push({name: item, y: value, previous: previous, commitedrating: commitedrating, currentrating: currentrating, color:'', comment: comment});
        }

        for(var i=0; i<processvalue.length; i++) {
            for(var j=0; j<colorcodes.length; j++) {
                processvalue[i]['color'] = colorcodes[i];
            }
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
                var category = processdata(docs, categories, type);
                // console.log(category.length);
                
                var spendcategory = spendCategory(category, type);
                let intersection = category.filter(x => !spendcategory.includes(x));
                // console.log('intersection', intersection);
                var othery = 0;
                var otherprevious = 0;
                var othercommitedrating = 0;
                var othercurrentrating  = 0;
                var othercolor;

                for(let item of intersection) {

                     othery = othery +  parseInt(item['y']);
                     otherprevious = otherprevious + parseInt(item['previous']);
                     othercommitedrating = parseInt(item['commitedrating']);
                     othercurrentrating = parseInt(item['currentrating']);
                     othercolor = item['color'];

                }
                spendcategory.push({name: 'Others', y: othery,previous: otherprevious, commitedrating: othercommitedrating, currentrating: othercurrentrating, color:othercolor});
                spendcategory = spendcategory.sort((a, b) => b.y - a.y);

                var items = [];
                for(let item of spendcategory) {
                    items.push(item['name']);
                }

                res.status(200).send({ data: spendcategory, categories: items});
            } else {
                return next(err);
                // res.send({message:err});
            }

        });
        function spendCategory(supp, type) {
            supp.sort((a, b) => b.y - a.y);
            supp = supp.slice(0, 10);
            return supp;
        }
        function processdata(docs, supp, type) {
            var processvalue = [];
            var colorcodes = ['#7cc0f7', '#ff4b4c', '#070fb0', '#1769a3', '#1aa8a9', '#ffac4e', '#03cb44', '#ff6b1b', '#a42cee', '#ff4d6f'];
            var value = 0;
            var previous = 0;
            var commitedrating;
            var currentrating;
            var comment;
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
                        comment = items['CurrentSC_Comment']
                    }
                }
                processvalue.push({name: item, y: value, previous: previous, commitedrating: commitedrating, currentrating: currentrating, color:'', comment: comment});
            }
            for(var i=0; i<processvalue.length; i++) {
                for(var j=0; j<colorcodes.length; j++) {
                    processvalue[i]['color'] = colorcodes[i];
                }
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
            var deptbu = processdata(docs, deptBu, type);
            var process = spendDepbu(deptbu, type);
            let intersection = deptbu.filter(x => !process.includes(x));
            var othervalue = 0;
            var othercommitedrating = 0;
            var otherprevious = 0;
            var othercurrentrating = 0;
            var othercolor;
            for(let item of intersection) {
                 othervalue = othervalue + parseInt(item['y']);
                 othercommitedrating = parseInt(item['commitedrating']);
                 othercurrentrating = parseInt(item['currentrating']);
                 otherprevious = otherprevious + parseInt(item['previous']);
                 othercolor = item['color'];
            }
            process.push({name: 'Others', y: othervalue, previous: otherprevious, commitedrating: othercommitedrating, currentrating: othercurrentrating, color:othercolor})
            process = process.sort((a, b) => b.y - a.y);
            var dbs = [];
            for(let item of process) {
                dbs.push(item['name'])
            }
            res.status(200).send({ data: process, dept: dbs});
        } else {
            return next(err);
            // res.send({message:err});
        }

    });

    function spendDepbu(supp, type) {
        supp.sort((a, b) => b.y - a.y);
        supp = supp.slice(0, 10);
        return supp;
    }
    function processdata(docs, supp, type) {
        var processvalue = [];
        var colorcodes = ['#7cc0f7', '#ff4b4c', '#070fb0', '#1769a3', '#1aa8a9', '#ffac4e', '#03cb44', '#ff6b1b', '#a42cee', '#ff4d6f'];
        var value = 0; 
        var previous = 0;
        var commitedrating;
        var currentrating;
        var comment;
        for(let item of supp) {
            value = 0;
            previous = 0;
            for(let items of docs) {
                if(item == items['DeptBU']) {
                    value = value + parseInt(items[type]);
                    previous = previous + parseInt(items[amounttype]);
                    commitedrating = parseInt(items['CommitedSD_rating']);
                    currentrating = parseInt(items['CurrentSD_rating']);
                    comment = items['CurrentSD_Comment'];
                }
            }
            processvalue.push({name: item, y: value, previous: previous, commitedrating: commitedrating, currentrating: currentrating, color:''});
        }
        for(var i=0; i<processvalue.length; i++) {
            for(var j=0; j<colorcodes.length; j++) {
                processvalue[i]['color'] = colorcodes[i];
            }
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
                var othercolor;
                for (let item of intersection) {
                    othercount = othercount + parseInt(item['value']);
                    othercolor = item['color'];
                }
                sorteddata.push({"name": "Others", "y": othercount, color: othercolor, tablecolor: ''})
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
                 suppliersaving.push({name: item, y: savings, color:'', tablecolor: '',previous :'0' });
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
                sortedvalue.push({name:'other', y: othervalue, color: othercolor, previous: otherprevious , y: othery, commitedrating: otherCOrating, currentrating: otherCUrating});

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
                    processvalue.push({name: item, y: value, color: '', previous: previous, y: value, commitedrating: commitedrating, currentrating: currentrating});
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
                const filterMonth = processMonth(docs);
                const filterQuaterly = processQuaterly(docs);
                const yearly = processYearly(docs);
                const weekly = processWeekly(docs);
                for(let item of docs) {
                    // console.log(moment(item['date'], "MM-DD-YYYY").format('MMM YYYY'));
                    goal.push(150000);
                    actual.push(parseInt(item['CurrentAmount_2019']));
                }
                // goal = goal.slice(0,100);
                // actual = actual.slice(0, 100);
                res.status(200).send({goal: goal, actual: actual, monthrecords: filterMonth, quater: filterQuaterly, yearly: yearly, weekly: weekly});
            }else {
                return next(err);
                // res.send({message:err});
            }
        });


        function processMonth(docs) {
            var Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var monthrecords = [];
            var count;
            var goal;
            for(let item of Months) {
                count = 0;
                goal = 0;
                for(let items of docs) {
                    // console.log(moment(items['date'], "MM-DD-YYYY").format('MMM'));
                    if(item == moment(items['date'], "MM-DD-YYYY").format('MMM')) {
                        count = count + parseInt(items['CurrentAmount_2019']);
                        goal = 1930000;
                    }
                }
                monthrecords.push({month: item, actual: count, goal: goal});
            }
            return monthrecords;
        }

        function processQuaterly(docs) {
            var Months = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
            var monthquater = [];
            var q1 = 0;
            var q2 = 0;
            var q3 = 0;
            var q4 = 0;
            var goal;
            // for(let item in Months) {
            //     q1 = 0;
            //     goal = 0;
                for(let items in docs) {
                    if(moment(docs[items]['date'], "MM-DD-YYYY").format('M') < 4) {
                        q1 = q1 + parseInt(docs[items]['CurrentAmount_2019']);
                        goal = 7000000;
                    }
                }
                for(let items in docs) {
                    if(moment(docs[items]['date'], "MM-DD-YYYY").format('M') > 3 && moment(docs[items]['date'], "MM-DD-YYYY").format('M') < 7) {
                        q2 = q2 + parseInt(docs[items]['CurrentAmount_2019']);
                        goal = 7000000;
                    }
                }
                for(let items in docs) {
                    if(moment(docs[items]['date'], "MM-DD-YYYY").format('M') > 6 && moment(docs[items]['date'], "MM-DD-YYYY").format('M') < 10) {
                        q3 = q3 + parseInt(docs[items]['CurrentAmount_2019']);
                        goal = 7000000;
                    }
                }
                for(let items in docs) {
                    if(moment(docs[items]['date'], "MM-DD-YYYY").format('M') > 9 && moment(docs[items]['date'], "MM-DD-YYYY").format('M') < 13) {
                        q4 = q4 + parseInt(docs[items]['CurrentAmount_2019']);
                        goal = 7000000;
                    }
                }
                monthquater.push({month: Months[0], actual: q1, goal: goal});
                monthquater.push({month: Months[1], actual: q2, goal: goal});
                monthquater.push({month: Months[2], actual: q3, goal: goal});
                monthquater.push({month: Months[3], actual: q4, goal: goal});
            // }
            return monthquater;
        }

        function processYearly(docs) {
            var years = ['2019', '2020'];
            var year2019 = 0;
            var year2020 = 0;
            var records = [];
            var goal;
            for(let items in docs) {
                if(moment(docs[items]['date'], "MM-DD-YYYY").format('Y') == 2019) {
                    year2019 = year2019 + parseInt(docs[items]['CurrentAmount_2019']);
                    goal = 22000000;
                }else if(moment(docs[items]['date'], "MM-DD-YYYY").format('Y') == 2020) {
                    year2020 = year2020 + parseInt(docs[items]['CurrentAmount_2019']);
                    goal = 22000000;
                }
            }
            records.push({month: years[0], actual: year2019, goal:goal});
            records.push({month: years[1], actual: year2020, goal:goal});

            return records;
        }

        function processWeekly(docs) {
            var weeks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            var records = [];
            var goal;
            var actual;
            var finalrecords = [];
            var records = docs.filter(x => moment(x['date'], "MM-DD-YYYY").format('Y') == 2020 && moment(x['date'], "MM-DD-YYYY").format('M')== 2);
            var currentDate = moment();

            var weekStart = currentDate.clone().startOf('isoWeek');
            var weekEnd = currentDate.clone().endOf('isoWeek');
          
            var days = [];
            var total = moment('02/03/2020', "MM-DD-YYYY").format('d');
            console.log(total);
          
            for (var i = 0; i <= total; i++) {
              days.push(moment(weekStart).add(i, 'days').format("dddd"));
            }
            console.log(days);
            for(let item of days) {
                
                actual = 0;
                for(let items of records) {
                    // console.log(item);
                    // console.log(moment(items['date'], "MM-DD-YYYY").format('dddd'));
                    if(item == moment(items['date'], "MM-DD-YYYY").format('dddd')) {
                       actual = actual + parseInt(items['CurrentAmount_2019']);
                       goal = 260000;
                    }
                }
                finalrecords.push({month: item, actual: actual, goal})
            }

            return finalrecords;
        }
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

    exports.postSScomment = (req,res) => {
        console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ SupplierName: req.body.name }, { CommitedSS_Comment: req.body.comment }, (err, docs) => {
                if (!err) {
                    // console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else {
            CatModel.updateMany({ SupplierName: req.body.name }, { CurrentSS_Comment: req.body.comment }, (err, docs) => {
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

    exports.postSCcomment = (req,res) => {
        // console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ Category: req.body.name }, { CommitedSC_Comment: req.body.comment }, (err, docs) => {
                if (!err) {
                    // console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else {
            CatModel.updateMany({ Category: req.body.name }, { CurrentSC_Comment: req.body.comment }, (err, docs) => {
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

    exports.postSDcomment = (req,res) => {
        // console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ DeptBU: req.body.name }, { CommitedSD_Comment: req.body.comment }, (err, docs) => {
                if (!err) {
                    // console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else {
            CatModel.updateMany({ DeptBU: req.body.name }, { CurrentSD_Comment: req.body.comment }, (err, docs) => {
                if (!err) {
                    // console.log('else',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }
        
    }

    exports.postCVrating = (req,res) => {
        console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ ContractName: req.body.name }, { CommitedCV_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else if(req.body.type == 'CurrentAmount_2019') {
            CatModel.updateMany({ ContractName: req.body.name }, { CurrentCV_rating: req.body.rating }, (err, docs) => {
                if (!err) {
                    console.log('else',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }
        
    }

    exports.postCVcomment = (req,res) => {
        console.log(req.body);
        if(req.body.type == 'CommittedAmount_2019') {
            CatModel.updateMany({ ContractName: req.body.name }, { CommitedCV_Comment: req.body.comment }, (err, docs) => {
                if (!err) {
                    console.log('if',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }else if(req.body.type == 'CurrentAmount_2019') {
            CatModel.updateMany({ ContractName: req.body.name }, { CurrentCV_Comment: req.body.comment }, (err, docs) => {
                if (!err) {
                    console.log('else',docs);
                    res.status(200).send('updated succesfully');
                }
            });
        }
        
    }

    ////supplierscreen

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

    exports.getbysupplier = (req, res) => {
        var suppliername = req.query.param;
        CatModel.find({}, (err, docs)=> {
            if(!err) {
                const docss = processdata(docs);
                res.status(200).send(docss);
            }
        });
        function processdata(docs) {
              var commited = 0;
              var current = 0;
              var AnnualisedS = 0;
              var CurrentS = 0;
              var contracts = [];
              var processData = [];
              var annualisedsavings = 0;
              var currentsavings = 0;
              var totalcontracts = [];
              var enterprises = [];
              for(let item of docs) {
                  if(item['SupplierName'] == suppliername) {
                      commited = commited + parseInt(item['CommittedAmount_2019']);
                      current = current + parseInt(item['CurrentAmount_2019']);
                      AnnualisedS = AnnualisedS + parseInt(item['CommittedAmount_2018']);
                      CurrentS = CurrentS + parseInt(item['CurrentAmount_2018']);
                      contracts.push(item['ContractName']);
                      enterprises.push(item['Enterprises']);
                    //   console.log(item);

                  }
              }
              annualisedsavings = commited - AnnualisedS;
              currentsavings = current - CurrentS;
              contracts = contracts.reduce(function(a, d) {
                if (a.indexOf(d) === -1) {
                    a.push(d);
                }
                return a;
            }, []);
            enterprises = enterprises.reduce(function(a, d) {
                if (a.indexOf(d) === -1) {
                    a.push(d);
                }
                return a;
            }, []);
            // console.log(enterprises);
            const CVdata = processCVData(contracts, docs);
            const CVChartdata = processCVChart(enterprises, docs);
            processData.push({commitedSpend: commited, currentSpend: current, contracts: contracts.length, ASavings: annualisedsavings, CSavings: currentsavings, cvdata: CVdata, chartdata: CVChartdata});

              return processData;
        }

        function processCVData(contracts, docs) {
            var cvdata = [];
            var commitedCV = 0;
            var currentCV = 0;
            var commitedrating;
            var currentrating;
            for(let item of contracts) {
                commitedCV = 0;
                currentCV = 0;
                for(let items of docs) {
                    if(items['SupplierName'] == suppliername && items['ContractName'] == item) {
                        // console.log(items);
                        commitedCV = commitedCV + parseInt(items['CommittedAmount_2019']);
                        currentCV = commitedCV + parseInt(items['CurrentAmount_2019']);
                        commitedrating = items['CommitedCV_rating'];
                        currentrating = items['CurrentCV_rating'];
                    }
                }
                // console.log(commitedCV);
                cvdata.push({ContractName: item, commited: commitedCV, current: currentCV, crs: 23, commitedrating: commitedrating, currentrating: currentrating})
            }

            return cvdata;
        }

        function processCVChart(enterprises, docs) {
            // console.log(enterprises);
            var enterpriseChartdata = [];
            var enterpriseSpend = 0;
            // if(enterprises) {
                for(let item of enterprises) {
                    enterpriseSpend = 0;
                    for(let items of docs) {
                        if(items['SupplierName'] == suppliername && items['Enterprises'] == item) {
                              enterpriseSpend = enterpriseSpend + parseInt(items['Enterprise_Spend']);
                        }
                    }
                    enterpriseChartdata.push({name: item, y: enterpriseSpend});
                }
                // console.log(enterpriseChartdata);
                return enterpriseChartdata;
            // }
        }
    }

///////category profile

  exports.getCategories = (req, res) => {
    var category = [];
    CatModel.find({}, (err, docs) => {
        if(!err) {
            category = docs.reduce(function(a, d) {
              if (a.indexOf(d.Category) === -1) {
                  a.push(d.Category);
              }
              return a;
          }, []);
          res.status(200).send({data: category})
        }
    })
  }

  exports.getCategoryInfo = (req, res) => {
      var category = req.query.param;
      CatModel.find({},(err, docs) => {
          if(!err) {
             var metadata = processData(docs);
             var tabledata = processTableData(docs);
             var chartdata = processChartdata(docs);
               res.status(200).send({metadata: metadata, tabledata: tabledata, chartdata: chartdata});
          }
      });
      function processData(docs) {
          var metadata = [];
          var suppliers = [];
        // console.log('commitedAmount',commitedAmount);
        var result = docs.filter(x => x.Category == category);
        var commitedAmount2019 = result.reduce((a, b) => a + (parseInt(b['CommittedAmount_2019']) || 0), 0);
        var currentAmount2019 = result.reduce((a, b) => a + (parseInt(b['CurrentAmount_2019']) || 0), 0);
        var commitedAmount2018 = result.reduce((a, b) => a + (parseInt(b['CommittedAmount_2018']) || 0), 0);
        var currentAmount2018 = result.reduce((a, b) => a + (parseInt(b['CurrentAmount_2018']) || 0), 0);
        var currentSavings = commitedAmount2019 - currentAmount2018;
        var annualised = commitedAmount2018 - currentAmount2018;
        suppliers = result.reduce(function(a, d) {
            if (a.indexOf(d.SupplierName) === -1) {
                a.push(d.SupplierName);
            }
            return a;
        }, []);
        metadata.push({commitedSpend: commitedAmount2019, currentSpend: currentAmount2019, currentSavings: currentSavings, annualisedSavings: annualised, totalSuppliers: suppliers.length});
        return metadata;
      }
      function processTableData(docs) {
          var tabledata = [];
          var cat = [];
          var commited = 0;
          var currentx = 0;
          var final = [];
          var result = docs.filter(x => x.Category == category);
         
          tabledata = result.reduce(function(a,d) {
               a.push({SupplierName: d.SupplierName, Commited: parseInt(d.CommittedAmount_2019), Current: parseInt(d.CurrentAmount_2019), Rating: d.CommitedSS_rating})
               return a;
            }, []);
            cat = tabledata.reduce(function(a,d) {
                if(a.indexOf(d.SupplierName) === -1) {
                    a.push(d.SupplierName);
                }
                return a;
            }, []);

          for(let item of cat) {
              commited = 0;
              currrentx = 0;
              var rating;
              for(let items of tabledata) {
                  if(item == items['SupplierName']) {
                    commited = commited + items['Commited'];
                    currentx = currentx + items['Current'];
                    rating = items['Rating'];
                  }
              }
              final.push({SupplierName: item, Commited: commited, Current: currentx, Rating: rating})
          }
          return final;

      }

      function processChartdata(docs) {
        var dept = [];
        var final = [];
        var commited = 0;
        var result = docs.filter(x => x.Category == category);
        dept = result.reduce(function(a,d) {
            if(a.indexOf(d.DeptBU) === -1) {
                a.push(d.DeptBU);
            }
            return a;
        }, []);

        for(let item of dept) {
            commited = 0;
            for(let items of result) {
                if(item == items['DeptBU']) {
                    commited = commited + parseInt(items['CommittedAmount_2019']);
                }
            }
            final.push({name: item,  y: commited});
        }
        return final;
      }
  }

  //////deptbu

  exports.getDeptfilters = (req, res) => {
        CatModel.find({}, (err, docs) => {
            var deptbu = [];
            if(!err) {
                deptbu = docs.reduce(function(a,d) {
                    if(a.indexOf(d.DeptBU) === -1) {
                        a.push(d.DeptBU);
                    }
                    return a;
                }, []);
                res.status(200).send(deptbu);
            }
        })
  }

  exports.getbyDeptBuInfo = (req, res) => {
      var deptbu = req.query.param;
    CatModel.find({}, (err, docs) => {
        var deptbu = [];
        if(!err) {
            var metadata = processData(docs);
            var chartdata = processChartdata(docs);
            var tabledata = processTabledata(docs);
            res.status(200).send({metadata: metadata, chartdata: chartdata, tabledata: tabledata});
        }
    });
    function processData(docs) {
        var metadata = [];
        var suppliers = [];
        var contracts = [];
      // console.log('commitedAmount',commitedAmount);
      var result = docs.filter(x => x.DeptBU == deptbu);
      var commitedAmount2019 = result.reduce((a, b) => a + (parseInt(b['CommittedAmount_2019']) || 0), 0);
      var currentAmount2019 = result.reduce((a, b) => a + (parseInt(b['CurrentAmount_2019']) || 0), 0);
      var commitedAmount2018 = result.reduce((a, b) => a + (parseInt(b['CommittedAmount_2018']) || 0), 0);
      var currentAmount2018 = result.reduce((a, b) => a + (parseInt(b['CurrentAmount_2018']) || 0), 0);
      var currentSavings = commitedAmount2019 - currentAmount2018;
      var annualised = commitedAmount2018 - currentAmount2018;
      suppliers = result.reduce(function(a, d) {
          if (a.indexOf(d.SupplierName) === -1) {
              a.push(d.SupplierName);
          }
          return a;
      }, []);
      contracts = result.reduce(function(a, d) {
        if (a.indexOf(d.ContractName) === -1) {
            a.push(d.ContractName);
        }
        return a;
    }, []);
      metadata.push({commitedSpend: commitedAmount2019, currentSpend: currentAmount2019, currentSavings: currentSavings, annualisedSavings: annualised, totalSuppliers: suppliers.length, contracts: contracts.length});
      return metadata;
    }

    function processChartdata(docs) {
        var contracts = [];
        var result = docs.filter(x => x.DeptBU == deptbu);
        contracts = result.reduce(function(a, d) {
            if (a.indexOf(d.ContractName) === -1) {
                a.push(d.ContractName);
            }
            return a;
        }, []);
        var commited;
        var final = [];
        for(let item of contracts) {
            commited = 0;
            for(let items of result) {
                if(item == items['ContractName']) {
                    commited = commited + parseInt(items['CommittedAmount_2019']);
                }
                    
                
            }
            final.push({name: item, y: commited, color: ''});
        }
        return final;
    }

    function processTabledata(docs) {
        var contracts = [];
        var result = docs.filter(x => x.DeptBU == deptbu);
        contracts = result.reduce(function(a, d) {
            if (a.indexOf(d.ContractName) === -1) {
                a.push(d.ContractName);
            }
            return a;
        }, []);
        var commited;
        var final = [];
        for(let item of contracts) {
            commited = 0;
            for(let items of result) {

                if(item == items['ContractName']) {
                    commited = commited + parseInt(items['CommittedAmount_2019']);
                }
                
            }
            final.push({name: item, y: commited, color: ''});
        }
        return final;
    }
}

exports.testmodal = (req, res, next) => { 
    var newkeys = ["ContractName", "SupplierName", "Sup_mail", "Sup_Address"];
    var refArray = [{excelkey: "ContractName", newKey: "ContractName"},{excelkey: "SupplierName", newKey: "SupplierName"},{excelkey: "Sup_mail", newKey: "Sup_mail"},{excelkey: "Sup_Address", newKey: "Sup_Address"}]
    var obj = newkeys.reduce(function (o, val) { o[val] = null; return o; }, {});
    var final = [];
    var result = [];
    CatModel.find({}, (err, docs) => {
        result = docs;
        for(let item of docs) {
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
        final.forEach(function(item) {
            refArray.forEach(function(data) {
                item[data['excelkey']] = result.find(x=>x.uuid==item.uuid)['_doc'][data['newKey']];
                // console.log(item[data['newkey']]);
              });
        });
        res.status(200).send(final);
        
        });
}

exports.getallinfo = (req,res) => {
    var type = req.body.type;
    var cmm = req.body.commitedamounttype;
    var cm = req.body.currentamounttype
    var commitedamounttype;
    var currentamounttype;
    var all = [];
    var incomingcomment;
    var incomingcommittedrating;
    var incomingcurrentrating;
    if(cmm == "CommittedAmount_2019") {
        commitedamounttype = 'CommittedAmount_2018';
    }
    else if(cmm == "CurrentAmount_2019") {
        currentamounttype = 'CurrentAmount_2018'
    }
    if(type =="Category") {
        incomingcomment = 'CommitedSC_Comment';
        incomingcommittedrating = 'CommitedSC_rating';
        incomingcurrentrating = 'CurrentSC_rating';
    }else if(type == "SupplierName") {
        incomingcomment = 'CommitedSS_Comment';
        incomingcommittedrating = 'CommitedSS_rating';
        incomingcurrentrating = 'CurrentSC_rating';
    }else if(type == "DeptBU") {
        incomingcomment = 'CommitedSD_Comment';
        incomingcommittedrating = 'CommitedSD_rating';
        incomingcurrentrating = 'CurrentSC_rating';
    }
    CatModel.find({}, (err, docs) => {
        if(!err) {
            all = docs.reduce(function(a, d) {
                if (a.indexOf(d[type]) === -1) {
                    a.push(d[type]);
                }
                return a;
            }, []);
            // res.status(200).send({msg: all});
            const data = processdata(all,docs, type);
            res.status(200).send(data);
        }else {
            res.status(400).send({msg: 'Something Went Wrong'});
        }
    });

    function processdata(all, docs, type) {
        var records = [];
        var y;
        var previous;
        var comment;
        var commitedrating;
        var currentrating;
        for (let item of all) {
            y = 0;
            previous = 0;
            for(let items of docs) {
                 
                 if(item == items[type]) {
                    
                      y = y + parseInt(items[cmm]);
                      previous = previous + parseInt(items[commitedamounttype]);
                      currentrating = items[incomingcurrentrating];
                      comment = items[incomingcomment];
                      commitedrating = items[incomingcommittedrating];
                 }
            }
            records.push({name: item, y: y, previous: previous, commitedrating: commitedrating, currentrating: currentrating, comment: comment});
        }
        return records;
    }

}