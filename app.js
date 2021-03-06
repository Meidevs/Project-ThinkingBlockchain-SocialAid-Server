var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var groupRouter = require('./routes/group');
var usersRouter = require('./routes/users');
var rewardsRouter = require('./routes/rewards');
var otcRouter = require('./routes/index');
var cron = require('./routes/schedule');

var app = express();
// Sessions
const session = require('express-session');
const FileStore = require('session-file-store')(session);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  rolling : true,
  store: new FileStore(),
  cookie : {
   maxAge: 2592000000,
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', groupRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/users', usersRouter);
app.use('/otc', otcRouter);

// app.use(cron);

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
