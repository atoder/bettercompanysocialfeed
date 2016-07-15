$(document).ready(function(){

	// var socket = io.connect('http://localhost:3000');
  // We don't want to hardcode the host and port so we can deploy to any host/port
  // If you don't specify any port or host as,  it defaults to the host and port of the current page.
  var socket = io.connect();

  var chatWindow = $('#chatWindow');

  // Compose button listener
  $('#fixed-wrapper').click(function(){ 
    $('#composeModal').modal();
  });

  $('#submit-post').click(function(){
    var msgTxt = $('#message-text').val()
    $('#composeModal').modal('hide');
    socket.emit('send message', msgTxt);
    console.log('sending message');
    $('#message-text').val('');
  });

  socket.on('show message', function(data){
    displayMessages(data);
  });

  socket.on('load old messages', function(data){
    // when loading old messages, clear the div in case a server gets restarted and open chat window won't keep prepanding all messages
    chatWindow.empty();

    // iterate through all the data
    for(var i = 0; i < data.length; i++) {
      displayMessages(data[i]);
    }
  });

  function displayMessages(data) {
    console.log(data);
    // we are appending because the query got the results in descending order
    chatWindow.prepend('<div class="user-msg"><div class="row">' +
                          // determine if we have an avatar, if not request blank one
                         '<div class="col-xs-4 col-sm-4">' +
                           '<div class="user-avatar"><img src="/profile/images?profile=' + (data.avatar ? data.avatar : '') + '" alt="User Avatar" /></div>' +
                         '</div>' + 
                         '<div class="col-xs-8 col-sm-8">' +
                           '<div class="body-msg">' + data.msg + '</div>' + 
                         '</div></div>' + 
                         '<div class="row"><div class="additional-info">' + 
                          '<div class="col-xs-6 col-sm-6"><div class="user-email">' + data.email + '</div></div>' + 
                          '<div class="col-xs-6 col-sm-6"><div class="user-timestamp">' + data.localTimestamp + '</div></div></div></div>' + 
                       '</div>');

  }
});