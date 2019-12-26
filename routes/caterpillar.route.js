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

router.post('/postCaterpillarOverview', caterpillarController.postCatOverview);

module.exports = router;
