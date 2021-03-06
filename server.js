// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
const upload = require('express-fileupload')
var app = express();
var port = process.env.PORT || 9000;
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');


var db
//video chatting variables
// http server (http library dependency)
const server = require('http').Server(app)
// takes http object as an argument
const io = require('socket.io')(server)
const {  v4: uuidV4} = require('uuid')

// configuration ===============================================================
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db);
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'))

app.use(upload())
//videochatting code
app.set('view engine', 'ejs'); // set up ejs for templating
// how to connect routes without breaking

// establish connection using roomID and
// removing socket io because we might not need it
// firt connection
io.on('connection', socket => {
  /// when connection is made and can join room to chat
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
// tells sockets connected to roomID to disconnet that specific user
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

// connecting to servers w/o socket io



// required for passport
app.use(session({
  secret: 'rcbootcamp2019a', // session secret
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
// app.listen(port);

server.listen(port)
console.log('The magic happens on port ' + port);
