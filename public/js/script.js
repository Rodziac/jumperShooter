io = io.connect();

var playerIndex = 0;

var renderLobby = function() {

    document.body.innerHTML = "" +
        "<div class='entrancePage'>" +
            "<input type='text' value='' id='roomNameContainer'/><span class='submitButton' id='entranceButton'></span>" +
            "<div class='errorContainer' id='errorContainer'/>" +
        "</div>";

};

var renderWaiting = function() {

    document.body.innerHTML = "" +
        "<div class='waitingPage'>" +
        "<span class='loadingSpinner'/>" +
        "</div>";

};

var renderArena = function() {

    document.body.innerHTML = "" +
        "<div class='arenaPage'>" +
        "<div class='arenaContainer' id='arenaContainer'>" +
        "<span class='thisPlayer'></span><span class='thatPlayer'></span></div>" +
        "<div class='scoreContainer' id='scoreContainer'></div>" +
        "</div>";

};

var lobbyEventHandler = function() {

    document.getElementById('entranceButton').addEventListener("click", function() {

        var roomName = document.getElementById('roomNameContainer').value;
        if (roomName != '') {
            io.emit('enterRoom', roomName, function(response) {
                if (!response.isRoomFull)
                    initWaiting(response);
                else
                    document.getElementById('errorContainer').innerHTML += "<div class='error'>" + roomName + " room full</div>";
            });
            }

    });

};

var waitingEventHandler = function() {

    io.on('roomReady', function() {

        initArena();

    });

};

var arenaEventHandler = function() {

    var downKeys = [];
    var thisPlayer = document.getElementsByClassName("thisPlayer")[0];
    var thatPlayer = document.getElementsByClassName("thatPlayer")[0];
    document.addEventListener("keydown", function(e){

        if(!downKeys[e.keyCode]) {
            downKeys[e.keyCode] = true;
        }

    });

    document.addEventListener("keyup", function(e){

        downKeys[e.keyCode] = false;

    });

    setInterval(function(){

        downKeys.forEach(function(item, index){

            if(item == true) {

                io.emit('keyDown', {roomName: 'test', key: index});

            }

        });

    }, 20);

    io.on('playerMove', function(data){

        var movingPlayer = data.index == playerIndex ?
            document.getElementsByClassName("thisPlayer")[0] :
            document.getElementsByClassName("thatPlayer")[0];

        movingPlayer.style.top = data.yPos + "px";
        movingPlayer.style.left = data.xPos + "px";

    });

    io.on('stopGame', function() {

        alert("The game has ended because your opponent has disconnected");
        window.location.reload(true);

    });

};

var initLobby = function() {

    renderLobby();
    lobbyEventHandler();

};

var initWaiting = function(response) {

    playerIndex = response.index;
    renderWaiting();
    waitingEventHandler();

};

var initArena = function() {

    renderArena();
    arenaEventHandler();

};

