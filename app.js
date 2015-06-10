engine = require('express.io');
app = engine().http().io();

app.use(engine.cookieParser());
app.use(engine.session({secret: 'monkey'}));

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.get('/:folder/:file', function(req, res) {
    res.sendfile(__dirname + '/public' + req.url);
});

app.io.route('enterRoom', function(req) {

    var userCount = getRoomPopulation(req.data, req);

    if (userCount < 2) {

        req.io.join(req.data);

        req.io.respond({'isRoomFull': false, index: userCount});

        req.session.index = userCount;

        req.session.save(function() {
            if (userCount == 1) {

                app.io.room(req.data).broadcast('roomReady', {});

                req.io.socket.on('disconnect', function(){
                    req.io.room(req.data).broadcast('stopGame');
                });

            }
        });

    } else {
        req.io.respond({'isRoomFull': true});
    }
});

app.io.route('keyDown', function(req){

    switch (req.data.key) {
        case 38:
            req.session.yPos -= 10;
            break;
        case 40:
            req.session.yPos += 10;
            break;
        case 37:
            req.session.xPos -= 10;
            break;
        case 39:
            req.session.xPos += 10;
            break;
    }

    req.session.save(function() {
        app.io.room(req.data.roomName).broadcast('playerMove', req.session);
    });

});

app.listen(3000);

var getRoomPopulation = function(roomId, req) {
    return app.io.sockets.clients(roomId).length;
};
