const url = '/geojson/SIG.geojson'

function init() {
    enterRoom()
    addPlayer()
    getMyId()

    gameStart()
}

function getMyId() {
    socket.emit('getMyId', (response) => {
        myId = response
        me = game.playerMap[myId]
    })
}

function enterRoom() {
    socket.emit('enterRoom', gameId, res => {
        console.log('[Server] Joined Room', res)
    })
}

function addPlayer() {
    socket.emit('addPlayer', gameId, nickname, async (res) => {
        update()
        console.log('[Player Registered]', game)
    })
}

function gameStart() {
    $('#start').click(() => socket.emit('start', gameId))
    socket.on('start', () => {
        $('#start').hide()
        console.log('[Game Started]')
        updateEach()
    })
}