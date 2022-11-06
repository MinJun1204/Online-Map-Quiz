function onGame() {
    occupy()
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

function occupy() {
    $(document).on('click', 'path', function(){
        let stateId = this.id
        let state = game.states[stateId]

        console.log(state)
        if (state.owner == null) {
            me.occupyState(state)
            game.nextTurn()
        }
    })
}