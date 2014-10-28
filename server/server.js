'use strict';
/*jslint unparam: true, node: true */

var express    = require('express');
var expressJWT = require('express-jwt');
var jwt        = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cors       = require('cors');
var morgan     = require('morgan');
var mongoose   = require('mongoose');
var cfg        = require('./config/config');
var User       = require('./models/user');
var helpers    = require('./lib/helpers');
var port       = process.env.PORT || 3000;
var app        = express();


// database ===============================================
mongoose.connect(cfg.mongoUrl);
helpers.ensureAdminUser();


// middleware =============================================
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// everything required jwt auth except for signup/auth endpoints
app.use(expressJWT({secret: cfg.jwtSecret}).unless({path: ['/auth/signup', '/auth/authenticate']}));


// load routes ============================================
app.use('/auth', require('./routes/auth')(cfg.jwtSecret));	// authentication routes
app.use('/protected', require('./routes/protected'));		// example protected routes
app.get('/random', function(req,res){ res.json({ random: Math.floor(Math.random() * 100), user: req.user }) });


// start server ===========================================
app.listen(port, function(){ console.log('Listening on port:', port); });