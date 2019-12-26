const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const multer = require('multer');
var path = require('path');



// Set up mongoose connection
const mongoose = require('mongoose');

let dev_db_url = 'mongodb://caterpillar:caterpillar123@ds215502.mlab.com:15502/kalyantds';
let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var app = express();

var originsWhitelist = [
    'http://www.dev.databotics.io'
];

var corsOptions = {
    origin: function(origin, callback){
          var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
          callback(null, isWhitelisted);
    },
    credentials:true
}

//Cors options

app.use(cors(corsOptions));

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization,X-Requested-With');
    next();
}

app.use(allowCrossDomain);



const userinfo = require('./routes/user.route');
const fileuploadInfo =  require('./routes/file.route');
const caterpillar = require('./routes/caterpillar.route');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use('/user',userinfo);
app.use('/file',fileuploadInfo);
app.use('/caterpillar', caterpillar);

// Use the passport package in our application
app.use(passport.initialize());
const passportMiddleware = require('./middleware/passport');
passport.use(passportMiddleware);


app.use('/', (req, res) => {
    res.send("This is something");
});

// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }
});

let port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server started on port`+port);
});


module.exports = app;