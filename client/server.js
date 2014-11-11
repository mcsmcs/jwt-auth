'use strict';
/*jslint unparam: true, node: true */

var express    = require('express');
var morgan     = require('morgan');
var port       = process.env.PORT || 8080;
var app        = express();

app.use(morgan('dev'));
app.use(express.static(__dirname));
app.get('*', function(req,res){ res.sendFile(__dirname + '/index.html'); });
app.listen(port, function(){ console.log('Listening on port:', port); });