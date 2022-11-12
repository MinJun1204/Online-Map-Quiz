function onGame() {
    occupy()
}

function update() {
    socket.emit('update', gameId)
    return new Promise((resolve, reject) => {
        socket.once('update', (_game, msg) => {
            game = _game
            console.log('[Update]', msg, game)
            resolve()
        })
    })
}

function updateEach() {
    socket.emit('updateEach', gameId)
}

function checkUpdate() {
    socket.on('update', (_game, msg) => {
        game = _game
        console.log('[Update]', msg, game)
        // socket.removeAllListeners('update')

        for (let state of game.states) {
            if (!state) continue

            if (state.owner) {
                $('#' + state.id)
                    .removeClass('fog')
                    .css({ 'fill': state.owner.color })
            }
        }
    })
}

function occupy() {
    $(document).on('click', 'path', function() {
        if (game.turn !== myOrder) return

        let stateId = parseInt(this.id)
     
        let state = game.states[stateId]

        console.log(state)
        if (state.owner == null) {
            socket.emit('occupy', gameId, myId, stateId)
        }
    })
}