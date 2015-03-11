var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);
var morgan = require('morgan');
var methodOverride = require('method-override');
var _ = require("underscore");
// var errorhandler = require('errorhandler');


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.disable("x-powered-by");
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    name: 'dj'
        // store: new MongoStore({
        //     db: config.db_name
        // }),
}));

app.get("/", function (req, res) {
    res.render("index");
});

var clients = [];
var messages = [];

app.get("/login", function (req, res) {
    if (req.body.name === 'jane' && req.body.password === '1102') {
        return res.send({
            code: 200
        });
    }
    if (req.body.name === 'tao' && req.body.password === '0908') {
        return res.send({
            code: 200
        });
    }
    return res.send({
        code: 302
    });
});

app.post("/message", function (req, res) {
    var message = req.body.message;
    if (_.isUndefined(message) || _.isEmpty(message.trim())) {
        return res.send({
            code: 400,
            msg: '信息为空'
        });
    }

    var name = req.body.name;

    io.sockets.emit("incomingMessage", {
        message: message,
        name: name
    });

    //Looks good, let the client know
    res.send({
        code: 200
    });

});

io.on('connection', function (socket) {
    socket.on("newUser", function (data) {
        clients.push({
            id: data.id,
            name: data.name
        });
        io.sockets.emit("newConnection", {
            clients: clients
        });
    });

    socket.on("disconnect", function () {
        clients = _.without(clients, _.findWhere(clients, {
            id: socket.id
        }));
        io.sockets.emit("userDisconnected", {
            id: socket.id,
            sender: "system"
        });
    });
});


http.listen(8080, function () {
    console.log('app listening on port 8080');
});
