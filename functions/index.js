const express = require('express');
const path = require('path');

const functions = require('firebase-functions');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const logger = require('morgan');

const busboyRouter = require('./busboy');
require("./admin/firebase").firebaseAdmin();

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', busboyRouter);

app.use(function(req, res, next) {
  next(createError(404));
});



app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


const api = functions.https.onRequest(app);

module.exports = {
    api
};