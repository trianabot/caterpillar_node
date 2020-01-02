const express = require('express');
const router = express.Router();
const passport = require('passport');

const caterpillarController = require('../controllers/caterpillar.controller');
// router.post('/resend', userController.resendTokenPost);

router.get('/test', caterpillarController.testuser);

router.post('/getCaterpillarOverviewSpend/:type', caterpillarController.getCatOverviewSpend);

router.post('/getSpendByCategory/:type', caterpillarController.getSpendByCategory);

router.post('/getSpendByDept/:type', caterpillarController.getSpendByDept);

router.post('/getSupplierSavings/:type', caterpillarController.getSupplierSavings);

router.post('/contractbyvalue/:type', caterpillarController.contractbyvalue);

router.get('/totalVendorsContracts', caterpillarController.totalVendorsContracts);

router.get('/digitalSavings', caterpillarController.digitalsavings);

router.post('/postSSRating', caterpillarController.postSSrating);

router.post('/postSCRating', caterpillarController.postSCrating);

router.post('/postSDRating', caterpillarController.postSDrating);

router.post('/postCVRating', caterpillarController.postCVrating);

router.post('/postCaterpillarOverview', caterpillarController.postCatOverview);

///////supplierscreen

router.get('/supplierfilters', caterpillarController.supplierfilters);

module.exports = router;
