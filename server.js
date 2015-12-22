var express = require('express'),
    app = express(),
    path = require('path'),
    fs = require('fs'),
    http = require('http').Server(app),
    io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, './public')));

var COMMENTS_FILE = path.join(__dirname, 'comments.json');

io.on('connection', function (socket) {
    console.log('User connected. Socket id %s', socket.id);

    socket.on('getComments', function (data) {
        fs.readFile(COMMENTS_FILE, function(err, data) {
            if (err) {
                console.error(err);
                socket.emit('comments',{});
            } else {
                var payload = JSON.parse(data);
                socket.emit('comments',payload);
            }
        });
    });

    socket.on('sendComments', function (comment) {
        fs.readFile(COMMENTS_FILE, function(err, data) {
            if (err) {
              console.error(err);
              process.exit(1);
            }
            var comments = JSON.parse(data);
            // NOTE: In a real implementation, we would likely rely on a database or
            // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
            // treat Date.now() as unique-enough for our purposes.
            var newComment = {
              id: Date.now(),
              author: comment.author,
              text: comment.text,
            };
            comments.push(newComment);
            fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err) {
                socket.emit('comments', comments);
            });
        });
    });

    socket.on('disconnect', function () {
        console.log('User disconnected. %s. Socket id %s', socket.id);
    });
});

http.listen(process.env.PORT);