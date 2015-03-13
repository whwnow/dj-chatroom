var name = '';
var messageVue = {};
var onlineVue = {};
var isAllowed = false;
if (window.Notification && window.Notification.requestPermission) {
    window.Notification.requestPermission(function (type) {
        isAllowed = type === 'granted';
    });
}

function updateScroll() {
    var top = $('#chatroom').scrollTop();
    $('#chatroom').scrollTop(top + 100);
}

function notify(name, msg, needShow) {
    var notification = new Notification(name, {
        icon: '/image/' + name + '40x40.png',
        body: msg
    });

    if (!needShow) {
        setTimeout(function () {
            notification.close();
        }, 5000);
    }
}

var bootstrap = function () {
    $('#login').click(function () {
        name = $('#name').val();
        $.post('/login', {
            name: name,
            password: $('#password').val()
        }).done(function (json) {
            if (json.code === 200) {
                $('#login-container').hide();
                initVue();
                initChatroom();
                $('#chatroom-container').show();
            }
        });
    });
    $('#password').on('keydown', function (event) {
        if (event.which == 13) {
            event.preventDefault();
            name = $('#name').val();
            $.post('/login', {
                name: name,
                password: $('#password').val()
            }).done(function (json) {
                if (json.code === 200) {
                    $('#login-container').hide();
                    initVue();
                    initChatroom();
                    $('#chatroom-container').show();
                }
            });
        }
    });
};

// var updateOnline

var initChatroom = function () {
    // var
    var socket = io();
    var sessionId = '';
    socket.on('connect', function () {
        sessionId = socket.io.engine.id;
        console.log('Connected ' + sessionId);
        socket.emit('newUser', {
            id: sessionId,
            name: name
        });
    });

    socket.on('newConnection', function (data) {
        messageVue.messages.push({
            name: 'admin',
            message: '欢迎 ' + data.name + ' 进入...',
            mine: false
        });
        onlineVue.onlines = data.clients;
        if (data.name !== name) {
            notify('admin', data.name + ' 已进入聊天室...', true);
        }
    });

    socket.on('userDisconnected', function (data) {
        messageVue.messages.push({
            name: 'admin',
            message: data.name + '断开连接！',
            mine: false
        });
        onlineVue.onlines = data.clients;
        if (data.name !== name) {
            notify('admin', data.name + ' 已离开聊天室...', true);
        }
    });

    socket.on('incomingMessage', function (data) {
        messageVue.messages.push({
            name: data.name,
            message: data.message,
            mine: data.name === name
        });
        notify(data.name, data.message);
    });

    socket.on('disconnect', function () {
        messageVue.messages.push({
            name: 'admin',
            message: '连接失败！',
            mine: false
        });
    });

    $('#message').on('keydown', function (event) {
        if (event.which == 13) {
            event.preventDefault();

            var msg = $('#message').val();

            if (msg.trim().length <= 0) {
                return;
            }
            $.post('/message', {
                message: msg,
                name: name
            }).done(function () {
                $('#message').val('');
            });

        }
    });

};

var initVue = function () {
    messageVue = new Vue({
        el: '#chatroom',
        data: {
            name: name,
            messages: []
        }
    });

    messageVue.$watch('messages', function () {
        updateScroll();
    });

    onlineVue = new Vue({
        el: '#online',
        data: {
            onlines: []
        }
    });
};


$(document).ready(bootstrap);
