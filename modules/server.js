let Rooms = require('./rooms')
let Game = require('./game')

let Server = (socket) => {
    this.games = []

    // Test Socket Event
    socket.on('hello', () => socket.emit('hello', 'Hello!'))

    // Check and Create Rooms
    socket.on('checkRooms', (cb) => cb(Rooms.rooms))
    socket.on('createRoom', (roomTitle, cb) => {
        Rooms.create(roomTitle, cb)
        
        let game = new Game()
        this.games.push(game)
    })

    // Enter the Room
    socket.on('enterRoom', (gameId, cb) => {
        socket.join(gameId)
        cb(gameId)
    })
}

module.exports = Server