const express = require('express');
const router = express.Router();
const passport = require('passport');

const user_controller = require('../controllers/user.controller');

router.get('/test', user_controller.testuser);

router.post('/registertenant', user_controller.registertenant);

router.post('/registeruser', user_controller.registeruser );

router.post('/registeradmin', user_controller.registeradmin);

router.get('/confirmation/:token', user_controller.confirmationPost);

router.post('/login', user_controller.loginuser);

router.get('/special', user_controller.specialauth);

router.post('/getuserdata', user_controller.getuserdata);

router.post('/usecase', user_controller.usecase);

router.get('/getusecase', user_controller.getusecase);

router.get('/manager', user_controller.manager);

router.post('/registerCaterpillar', user_controller.registerCaterpillar );

router.get('/getallusers', user_controller.getallusers);

router.post('/updateuser', user_controller.updateUser);

// router.post('/resend', userController.resendTokenPost);

module.exports = router;
