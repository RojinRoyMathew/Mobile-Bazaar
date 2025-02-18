var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var  hbs  = require('express-handlebars');
var {engine}  = require('express-handlebars');
var fileUpload=require('express-fileupload')
var session=require('express-session')
var app = express();

var mongoose= require('mongoose')
var dotenv = require('dotenv')

dotenv.config();
const MONGOURL = process.env.MONGO_URL;

// view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: '.hbs',                     // File extension for templates
  defaultLayout: 'layout',            // Default layout file
  layoutsDir: __dirname + '/views/layouts/',   // Directory for layouts
  partialsDir: __dirname + '/views/partials/'  // Directory for partials
}));


// Specify the directory to find views
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use(session({secret:"Key",cookie:{maxAge:600000},resave:true,saveUninitialized:true}))

mongoose.connect(MONGOURL).then(()=>{
  console.log("Database is connected successfully");
}).catch((error)=>console.log(error))


app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
