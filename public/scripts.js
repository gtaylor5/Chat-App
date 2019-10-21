$(() => {
  const FADE_TIME = 150;
  const TYPING_TIMER_LENGTH = 500;

  var colors = [];
  var $window = $(window);
  var $usernameInput = $('#username');
  var $messageInput = $('#messageInput');
  var $messages = $('#messages');

  var $loginPage = $('.login-page');
  var $chatPage = $('.chat-page');
  var username;
  var userColors = {};
  var connected = false;
  var typing = false;
  var lastTypingTime;

  var $currentInput = $usernameInput.focus();
  var socket = io();

  const setUsername = () => {
    username = $usernameInput.val().trim();
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $messageInput.focus();
      setUserColor(username);
      socket.emit('add user', username);
    }
  };

  const sendMessage = () => {
    var message = $messageInput.val();
    // surround with div?

    if (message && connected) {
      $messageInput.val('');
      addChatMessage({
        username: username,
        message: message
      });
      socket.emit('new message', message);
    }
  };

  const addChatMessage = (data, options) => {
    if (!userColors[data.username]) setUserColor(data.username);
    var $usernameSpan = $('<span class="username" />')
      .text(data.username)
      .css('color', userColors[data.username]);
    var $messageSpan = $('<span class="messageBody" />').text(data.message);
    var $messageDiv = $('<li class="message" />').data(
      'username',
      data.username
    );
    if (data.username === username) {
      $messageDiv.append($messageSpan);
      $messageDiv.addClass('self');
    } else {
      $messageDiv.append($usernameSpan, $messageSpan);
    }
    addMessageElement($messageDiv);
  };

  const setUserColor = username => {
    var str = '123456789ABCDEF';
    var userColor = '#';
    while (userColor.length < 7) {
      var random = Math.random() * str.length;
      userColor = userColor + str.charAt(random);
    }
    userColors[username] = userColor;
  };

  const addMessageElement = element => {
    $messages.append($(element));
    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  $window.keydown(e => {
    if (!(e.ctrlKey || e.metaKey || e.altKey)) $currentInput.focus();
    console.log(e.target.value);
    console.log(e.which);
    if (e.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop-typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $loginPage.click(() => {
    $currentInput.focus();
  });

  $messageInput.click(() => {
    $messageInput.focus();
  });

  socket.on('login', data => {
    connected = true;
  });

  socket.on('new message', data => {
    addChatMessage(data);
  });

  socket.on('user joined', data => {
    console.log(data);
    setUserColor(data.username);
  });

  socket.on('disconnect', () => {
    console.log('You have disconnected');
  });

  socket.on('reconnect', () => {
    if (username) {
      socket.emit('add user', username);
    }
  });
});
