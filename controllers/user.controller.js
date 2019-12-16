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


/**Create the token */
function createToken(user) {
    return jwt.sign({ id: user.userId, email: user.emailId }, config.jwtSecret, {
        expiresIn: 200 // 86400 expires in 24 hours
    });
}

exports.testuser = (req, res) => {
    res.send('this is test user data');
}

/**Register Superadmin */
exports.registeradmin = (req, res, next) => {
    // Make sure this account doesn't already exist
    SuperAdminModel.findOne({ emailId: req.body.emailId }, (err, user) => {
        // Make sure user doesn't already exist
        if (user) return res.status(400).send({ message: 'The email address you have entered is already associated with another account.' });
        // Create and save the admin
        var id = uuid();
        try {
            let registeradmin = new SuperAdminModel(
                {
                    adminId: id,
                    role: req.body.role,
                    userName: req.body.userName,
                    emailId: req.body.emailId,
                    password: req.body.password,
                    contactNumber: req.body.contactNumber,
                    sysCreatedBy: id,
                    sysUpdatedBy: id,
                    sysCreatedDate: new Date(),
                    sysUpdatedDate: new Date()
                }
            )
            registeradmin.save((err, admindata) => {
                if (!err) {
                    // save to logininfo collection
                    saveToLoginInfo(req, admindata);
                } else if (admindata == "" || admindata == []) {
                    res.send({ message: "Admin not registered please check the data" });
                } else {
                    return next(err);
                    // res.send({message:err});
                }
            });
        } catch (e) {
            log.error('Route failed with error', e);
            res.status(500).send(e);
        }
    });

    function saveToLoginInfo(request, adminuser) {
        var logininfo = new LoginInfoModel(
            {
                userName: adminuser.userName,
                role: adminuser.role,
                userId: adminuser.adminId,
                emailId: adminuser.emailId,
                password: adminuser.password,
                wrongAttempts: 0,
                sysCreatedBy: adminuser.sysCreatedBy,
                sysUpdatedBy: adminuser.sysUpdatedBy,
                sysCreatedDate: new Date(),
                sysUpdatedDate: new Date()
            }
        );

        logininfo.save((err, admindata) => {
            if (!err) {
                // Create a confirmation email token for this user
                generateConfirmationEmail(request, res, admindata);
            } else if (admindata == "" || admindata == []) {
                res.send({ message: "Admin not registered please check the data" });
            } else {
                return next(err);
                // res.send({message:err});
            }
        });
    }

}


/**Generate confirmation email */
function generateConfirmationEmail(req, res, admindatauser) {
    var token = new TokenGenModel({ userId: admindatauser.userId, token: randomstring.generate() });
    // Save the verification token
    token.save(function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }

        // Send the email
        var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: "trianbot@gmail.com", pass: "Tds@2019" } });
        var mailOptions = { from: 'trianbot@gmail.com', to: admindatauser.emailId, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n' };
        transporter.sendMail(mailOptions, function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }
            res.status(200).send({ message: 'Registration Successful . A verification email has been sent to ' + admindatauser.emailId + '.' });
        });
    });
}

/**Confirmation of email */
exports.confirmationPost = (req, res, next) => {
    TokenGenModel.findOne({ token: req.params.token }, function (err, token) {
        if (!token) return res.status(400).send({ type: 'not-verified', message: 'We were unable to find a valid token. Your token my have expired.' });

        // If we found a token, find a matching user
        LoginInfoModel.findOne({ userId: token.userId }, function (err, user) {
            console.log(token.userId);
            if (!user) return res.status(400).send({ message: 'We were unable to find a user for this token.' });
            if (user.isVerified) return res.status(400).send({ type: 'already-verified', message: 'This user has already been verified.' });

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                let body = {
                    message: "The account has been verified. Please log in."
                }
                res.status(200).send(body);
            });
        });
    });
}

/**Register tenant */

exports.registertenant = (req, res, next) => {
    // console.log(req.body);
    TenantRegisterModel.findOne({ emailId: req.body.emailId }, (err, user) => {
        if (user) return res.status(400).send({ message: 'The email address you have entered is already associated with another account.' });
        var id = uuid();
        try {
            let registertenant = new TenantRegisterModel(
                {
                    superAdminId: req.body.adminId,
                    clientId: id,
                    role: 'admin',
                    OTI: req.body.organizationName + '-' + req.body.adminName,
                    organizationName: req.body.organizationName,
                    organizationCategory: req.body.organizationCategory,
                    industries: req.body.organizationCategory,
                    industriesUsecase: req.body.industriesUsecase,
                    adminName: req.body.adminName,
                    adminRole: req.body.adminRole,
                    emailId: req.body.emailId,
                    contactNumber: req.body.contactNumber,
                    alternativeEmailId: req.body.alternativeEmailId,
                    password: req.body.password,
                    userName: req.body.userName,
                    securityQuestions: req.body.securityQuestions,
                    sysCreatedBy: id,
                    sysUpdatedBy: id,
                    sysCreatedDate: new Date(),
                    sysUpdatedDate: new Date()
                }
            )
            console.log(registertenant);
            registertenant.save((err, tenantdata) => {
                if (!err) {
                    // console.log(tenantdata);
                    saveToLoginInfoTenant(req, tenantdata);
                    // res.status(200).send({message: 'Created Succesfully', data:tenantdata});
                } 
                // else if (tenantdata == "" || tenantdata == []) {
                //     res.send({ message: "Tenant not registered please check the data" });
                // } 
                else {
                    return next(err);
                    // res.send({message:err});
                }
            });
        } catch (e) {
            log.error('Route failed with error', e);
            res.status(500).send(e);
        }
    });

    function saveToLoginInfoTenant(request, tenantuser) {
        var logininfo = new LoginInfoModel(
            {
                userName: tenantuser.userName,
                role: tenantuser.role,
                userId: tenantuser.clientId,
                emailId: tenantuser.emailId,
                password: tenantuser.password,
                OTI: tenantuser.OTI,
                organizationCategory: tenantuser.organizationCategory,
                industriesUsecase: tenantuser.industriesUsecase,
                wrongAttempts: 0,
                sysCreatedBy: tenantuser.sysCreatedBy,
                sysUpdatedBy: tenantuser.sysUpdatedBy,
                sysCreatedDate: new Date(),
                sysUpdatedDate: new Date()
            }
        );

        logininfo.save((err, tenantdata) => {
            if (!err) {
                res.status(200).send({message: 'Created Succesfully', data:tenantdata});
                // Create a confirmation email token for this user
                // generateConfirmationEmail(request, res, tenantdata);
            } else if (tenantdata == "" || tenantdata == []) {
                res.send({ message: "Tenant not registered please check the data" });
            } else {
                return next(err);
                // res.send({message:err});
            }
        });
    }
}

/*---manager user----*/

exports.manager = (req, res, next) => {
    // console.log(req.headers.authorization);
    if (req.headers && req.headers.authorization) {
        // console.log(req.headers.authorization);
        var authorization = req.headers.authorization;
        //     decoded;
        const token = authorization.split(' ');
        console.log('token:',token[0]);
        var decoded = jwt.verify(token[0], config.jwtSecret);
        console.log('decoded:',decoded);
            var emailId = decoded.email;
            // Fetch the user by id 
            LoginInfoModel.findOne({emailId: emailId}).then(function(user){
            // Do something with the user
            console.log('user:',user);
            return res.status(200).json({
                success: true,
                token: createToken(user),
                userData: user
            });
        });
        
        
    }else{
        return res.send(500);
    }
    // return res.send(500);
}


/**Register user */

exports.registeruser = (req, res, next) => {
    UserRegisterModel.findOne({ emailId: req.body.emailId }, (err, user) => {
        if (user) return res.status(400).send({ message: 'The email address you have entered is already associated with another account.' });

        var id = uuid();
        try {
            let registeruser = new UserRegisterModel(
                {
                    clientId: req.body.organizationId,
                    userId: id,
                    role: req.body.role,
                    userName: req.body.userName,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    industries: req.body.industries,
                    industriesUsecase: req.body.industriesUsecase,
                    emailId: req.body.emailId,
                    phone: req.body.phone,
                    alternateEmail: req.body.alternateEmail,
                    password: req.body.password,
                    OTI: req.body.OTI,
                    organizationCategory: req.body.organizationCategory,
                    designation: req.body.designation,
                    location: req.body.location,
                    sysCreatedBy: id,
                    sysUpdatedBy: id,
                    sysCreatedDate: new Date(),
                    sysUpdatedDate: new Date()
                }
            )

            registeruser.save((err, userdata) => {
                if (!err) {
                    saveToLoginInfoUser(req, userdata);
                } 
                // else if (userdata == "" || userdata == []) {
                //     res.send({ message: "User not registered please check the data" });
                // } 
                else {
                    return next(err);
                }
            });
        } catch (e) {
            log.error('Route failed with error', e);
            res.status(500).send(e);
        }
    });

    function saveToLoginInfoUser(request, user) {
        var logininfo = new LoginInfoModel(
            {
                userName: user.userName,
                role: user.role,
                userId: user.clientId,
                emailId: user.emailId,
                password: user.password,
                OTI: user.OTI,
                organizationCategory: user.organizationCategory,
                industriesUsecase: user.industriesUsecase,
                wrongAttempts: 0,
                sysCreatedBy: user.sysCreatedBy,
                sysUpdatedBy: user.sysUpdatedBy,
                sysCreatedDate: new Date(),
                sysUpdatedDate: new Date()
            }
        );

        logininfo.save((err, userdata) => {
            if (!err) {
                // Create a confirmation email token for this user
                // generateConfirmationEmail(request, res, userdata);
                res.status(200).send({message: 'Created Succesfully', data:userdata});
            } else if (userdata == "" || userdata == []) {
                res.send({ message: "User not registered please check the data" });
            } else {
                return next(err);
                // res.send({message:err});
            }
        });
    }
}

/**User login route */

exports.loginuser = (req, res, next) => {
    console.log(req.body);
    LoginInfoModel.findOne({
        emailId: req.body.emailId,
        password: req.body.password
    }, (err, user) => {
        if (err) throw err;

        if (!user) {
            res.send({ success: false, msg: 'Authentication failed. Wrong credentials' });
        } else if (!user.isVerified) {
            return res.status(400).send({ message: 'Please verify your email to login' });
        } else {
            // res.status(200).send({message: "Success logged in"});
            return res.status(200).json({
                success: true,
                token: createToken(user),
                userData: user
            });
        }

    });
}


exports.specialauth = (req, res, next) => {
    // return res.json({ msg: `Hey ${req.user.emailId}! I open at the close.` });
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
        console.log(info);
        if (user === false && info && info.message === 'No auth token') {
            // Just unauthorized - nothing serious, so continue normally
            return next(error);
        } else if (info && info.message === "jwt expired") {
            res.status(403).send({ message: "Token is expired" });
        }
        return authenticatedFunction(user, res);
    })(req, res, next);
    // return res.json({ msg: "Hi this is passport" });

    function authenticatedFunction(user, res) {
        res.send({ message: `Hey ${user}! I open at the close.` });
    }
};

/** Get the user details*/

exports.getuserdata = (req, res, next) => {
    if (req.body.role == 'User') {
        UserRegisterModel.findOne({ userId: req.body.userid }, (err, userdata) => {
            if (err) return next(err);
            if (!userdata) {
                res.send({ message: 'There is no user found for this id' });
            }else{
                res.send({ user_data: userdata });
            }
            
        });
    } else if (req.body.role == 'Client') {
        TenantRegisterModel.findOne({ clientId: req.body.userid }, (err, userdata) => {
            if (err) return next(err);
            if (!userdata) {
                res.send({ message: 'There is no user found for this id' });
            }
            else{
                res.send({ user_data: userdata });
            }
        });
    }
}

exports.usecase = (req, res, next) => {
    try{
    let usecase = new usecasemodel({
        industry:req.body.industry,
        usecase: req.body.usecase
    });
    usecase.save((err, usecasedata) => {
        if (!err) {
            // save to logininfo collection
            // saveToLoginInfo(req, admindata);
            res.send({ message: "usecase added", data: usecasedata });
        } 
        // else if (admindata == "" || admindata == []) {
        //     res.send({ message: "Admin not registered please check the data" });
        // } 
        else {
            return next(err);
            // res.send({message:err});
        }
    });
}
    catch (e) {
        log.error('Route failed with error', e);
        res.status(500).send(e);
    }
}

exports.getusecase = (req, res, next) => {
    usecasemodel.find({},(err, usecase) => {
        res.status(200).send({data: usecase})
    });
}

exports.registerCaterpillar = (req, res, next) => {
    console.log(req.body);
    LoginInfoModel.findOne({ emailId: req.body.emailId }, (err, user) => {
        if(user) return res.status(400).send({ message: 'The email address you have entered is already associated with another account.' });
    });
    var id = uuid();
    try {
        var logininfo = new LoginInfoModel(
            {
                userName: req.body.userName,
                role: req.body.role,
                userId: id,
                emailId: req.body.emailId,
                password: req.body.password,
                OTI: req.body.OTI,
                organizationCategory: req.body.organizationCategory,
                industriesUsecase: req.body.industriesUsecase,
                wrongAttempts: 0,
                sysCreatedBy: id,
                sysUpdatedBy: id,
                sysCreatedDate: new Date(),
                sysUpdatedDate: new Date()
            }
        );
    
        logininfo.save((err, tenantdata) => {
            if (!err) {
                res.status(200).send({message: 'Created Succesfully', data:tenantdata});
                // Create a confirmation email token for this user
                // generateConfirmationEmail(request, res, tenantdata);
            }
            //  else if (tenantdata == "" || tenantdata == []) {
            //     res.send({ message: "Tenant not registered please check the data" });
            // } 
            else {
                return next(err);
                // res.send({message:err});
            }
        });
    }catch(e) {
        log.error('Route failed with error', e);
        res.status(500).send(e);
    }
    
}
