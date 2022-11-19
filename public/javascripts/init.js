const url = '/geojson/newSIG.geojson'

async function init() {
    enterRoom()
    await addPlayer()
    getMyId()

    cursor()

    checkUpdate()
    gameStart()
}

function enterRoom() {
    socket.emit('enterRoom', gameId, res => {
        console.log('[Server] Joined Room', res)
    })
}

function addPlayer() {
    return new Promise((resolve, reject) => {
        socket.emit('addPlayer', gameId, nickname, async (res) => {
            await update()
            resolve()
            console.log('[Player Registered]')
        })
    })
}

function getMyId() {
    socket.emit('getMyId', (response) => {
        myId = response
        me = game.playerMap[myId]
        
        let i = 0
        for (let player of game.players) {
            if (player.id === myId) myOrder = i
            i++
        }
        console.log('[My ID]', myId, myOrder)
    })
}

function gameStart() {
    socket.once('start', () => {
        $('#start').hide()
        initUI()
    })
    $('#start').click(() => socket.emit('start', gameId))
}

function initUI() {
    console.log('Init UI', game)
    for (let id in game.playerMap) {
        let player = game.playerMap[id]
        $('#players').append(`<li id="${player.id}">${player.nickname}: ${player.population}</li>`)
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
    if (state.facilities.special) return "�윃�"
    if (state.facilities.port) return "�윓�"
    if (state.facilities.airport) return "�쐢截�"
    return ""
}