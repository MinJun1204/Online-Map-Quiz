const url = '/geojson/newSIG.geojson'

async function init() {
    enterRoom()
    await addPlayer()
    getMyId()

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
        console.log('[My ID]', myId)
    })
}

function gameStart() {
    socket.once('start', () => { $('#start').hide() })
    $('#start').click(() => socket.emit('start', gameId))
}