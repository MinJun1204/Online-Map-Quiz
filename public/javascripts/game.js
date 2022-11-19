function onGame() {
    cursor()
    chat()

    occupy()
    skip()
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

        if (game.turn === myOrder) {
            $('#turn, #skip').show()
        } else {
            $('#turn, #skip').hide()
        }

        for (let state of game.states) {
            if (!state) continue

            if (state.owner) {
                $('#' + state.id)
                    .removeClass('fog')
                    .css({ 'fill': state.owner.color })
                
                    for (let neighbor of state.neighbors) {
                        $('#' + neighbor).removeClass('fog')
                    }
            }
        }

        updateUI()
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

function updateUI() {
    for (let state of game.states) {
        if (!state) continue

        if (state.owner) {
            $('#' + state.id)
                .removeClass('fog')
                .css({ 'fill': state.owner.color })

            for (let neighbor of state.neighbors) {
                $('#' + neighbor)
                    .removeClass('fog')
            }
        }
    }

    for (let id in game.playerMap) {
        let player = game.playerMap[id]
        $('#' + player.id).text(`${player.nickname}: ${player.population} (${player.cost})`)
    }
}

function cursor() {
    $(document).on('mousemove', 'path', (e) => {
        let state = game.states[e.target.id]
        $('#cursor').css('display', 'auto').text(`${state.name} (${state.population})${stateNeighborEmoji(state)}`)
        $('#cursor').css('left', e.pageX + 15).css('top', e.pageY)
    })

    $(document).on('mouseenter', 'path', e => {
        let state = game.states[e.target.id]
        state.neighbors.forEach(idx => {
            if (e.target.id == idx) return
            if ($(`#${idx}`).hasClass('occupied')) return
            $(`#${idx}`).addClass('neighbor')
        })
    })

    $(document).on('mouseleave', 'path', e => {
        let state = game.states[e.target.id]
        state.neighbors.forEach(idx => {
            $(`#${idx}`).removeClass('neighbor')
        })
    })
}

function stateNeighborEmoji(state) {
    if (state.facilities.special) return "🎁"
    if (state.facilities.port) return "🚢"
    if (state.facilities.airport) return "✈️"
    return ""
}
    

function chat() {
    $('#chat').submit((e) => {
        e.preventDefault()

        let msg = $('#chat input').val()
        $('#chat input').val('')
        socket.emit('chat', msg)
    })

    $('#clear').click(() => $('#messages').empty())

    socket.on('chat', (id, msg) => {
        $('#messages').append(`<li>[${game.playerMap[id].nickname}] ${msg}`)
    })
}

function skip() {
    $('#skip').click(() => {
        socket.emit('skip', gameId)
    })
}