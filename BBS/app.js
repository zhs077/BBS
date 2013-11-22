/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    ,topic = require('./routes/topic')
    ,active_account = require('./routes/active_account')
    ,reset_pass = require('./routes/reset_pass')
    ,comment = require('./routes/comment')
    , http = require('http')
    , path = require('path')
    , ejs = require('ejs')
    , flash = require('connect-flash')
    , SessionStore = require('session-mongoose')(express)
    , set = require('./setting')
var store = new SessionStore({
    url:"mongodb://"+set.mongodb_host+"/session",
    poolSize:1,
    interval:1200000
});
var app = express();

// all environments
app.set('port', set.port|| 3000);
app.set('views', __dirname + '/views');
app.use(flash());
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
//app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({secret:'fens.me'}));
app.use(express.session({
    secret:'fens2.me',
    store:store,
    cookie:{maxAge:10000}
}));

//
app.use(function (req, res, next) {

    var err = req.flash('error');
    var info = req.flash('info');
    res.locals.message = '';
    //res.locals.message = err.length? err:null;
    res.locals.user = req.session.user;
    res.locals.links = req.session.links =set.links;
   res.locals.reg_statu = req.session.reg_statu;

   // delete req.session.user;

//    res.locals.user = req.session.user;
//    var err = req.session.error;
//    delete req.session.error;

    if (err.length != 0) {
        res.locals.message = '<div class="alert alert-error">' + err + '</div>';
    }
    if (info.length != 0) {

        res.locals.message = '<div class="alert alert-success"> <strong>' + info + '</strong></div>';
    }
    next();

});

app.use(app.router);
//app.use(topic);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//app.get('/', user.index);
//app.get('/users', user.list);
//app.get('/login', user.login);
//app.post('/login', user.doLogin);
//app.get('/reg', user.reg);
//app.post('/reg', user.doreg);

    routes(app);
    topic(app);
    user(app);
    active_account(app);
    reset_pass(app);
    comment(app);


//app.use(function(req,res,next){
//    var err = req.flash('error'),
//        success = req.flash('success');
//    res.locals.user = req.session.user;
//    res.locals.error = err.length ? err : null;
//    res.locals.success = success.length ? success : null;
//    next();
//});


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
