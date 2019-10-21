var app = require('express')();
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
app.use(express.json());

var numUsers = 0;

io.on('connection', socket => {
  socket.on('new message', data => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', username => {
    console.log(username);
    socket.username = username;
    addedUser = true;
    socket.emit('login', {
      numUsers: ++numUsers
    });
    socket.broadcast.emit('user joined', {
      username: username,
      numUsers: numUsers
    });
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

http.listen(3000, function() {
  console.log('listening on port 3000');
});
