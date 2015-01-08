var azure = require('azure-storage');
var blobSvc = azure.createBlobService();
blobSvc.createContainerIfNotExists('mycontainer', function(error, result, response){
  if(!error){
    blobSvc.createBlockBlobFromText('mycontainer', 'myblob', 'test', function(error, result, response) {
      if(!error){
        console.log("Blob created from Text successfully.");
      } else {
        console.log("Error creating blob");
      }
    });
  } else {
    console.log("Error creatting container");
  }
});




var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;
var path = require('path');

var usernames = [];
var numUsers = 0;
var numTAs = 0;

// Index
app.get('/', function(req, res){
  res.sendFile('index.html', {root: __dirname});
});
// TA Page
app.get('/TA', function(req, res){
  res.sendFile('ta.html', {root: __dirname});
});
// Static Files
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  var addedUser = false;
  var addedTA = false;
  updatePlayers();
  socket.on('join queue', function(username){
    socket.username = username;
    usernames.push({username: username, helped: false});
    ++numUsers;
    addedUser = true;
    updatePlayers();
  });

  socket.on('ta login', function(username, password) {
    if (password == '107') {
      socket.username = username;
      numTAs++;
      addedTA = true;
      socket.emit('success');
    }
  });

  socket.on('helping', function(index) {
    usernames[index].helped = true;
    updatePlayers();
  });

  socket.on('remove', function(index) {
    usernames.splice(index, 1);
    numUsers--;
    updatePlayers();
  });

  socket.on('remove all', function() {
    usernames = [];
    numUsers = 0;
    updatePlayers();
  });

  socket.on('update', function() {
    updatePlayers();
  });

  socket.on('disconnect', function() {
    if (addedTA) {
      numTAs--;
      updatePlayers();
    }
  });
});

function updatePlayers() {
  io.emit('update players', {
    numUsers: numUsers,
    usernames: usernames,
    numTAs: numTAs
  });
};

http.listen(port, function(){});