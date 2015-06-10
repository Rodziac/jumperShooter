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
        req.io.respond({'isRoomFull': false});

        if (userCount == 1) {

            app.io.room(req.data).broadcast('roomReady', {});

        }

    } else {
        req.io.respond({'isRoomFull': true});
    }
});

app.io.route('keyDown', function(req){

    app.io.room(req.data.roomName).broadcast('playerMove', {data: req.data.key});

});

app.listen(3000);

var getRoomPopulation = function(roomId, req) {
    return req.io.room(roomId).socket.manager.rooms['/' + roomId] ? req.io.room(roomId).socket.manager.rooms['/' + roomId].length : 0;
};
