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

function update() {
    socket.emit('update', gameId)
}

function updateEach() {
    socket.emit('updateEach', gameId)
}

function checkUpdate() {
    socket.on('update', (_game) => {
        game = _game
        console.log('[Update]', game)
        // socket.removeAllListeners('update')
    })
}