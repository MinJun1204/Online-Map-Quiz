let Rooms = require('./rooms')
let Game = require('./game')
let Player = require('./player')

class Server {
    constructor() {
        this.games = []
    }
    
    getGame(gameId) {
        let game = this.games.find(e => e.gameId == gameId)
        if (game === undefined) throw Error('Cannot Find Game')
        else return game
    }

    getPlayer(game, id) { return game.playerMap[id] }

    update(gameId, io, msg) {
        let game = this.getGame(gameId)
        io.to(gameId).emit('update', game, msg)
        console.log('[Server Update]')
    }

    updateEach(gameId, socket) {
        let game = this.getGame(gameId)
        socket.emit('update', game)
        console.log('[Server Update (Each)]')
    }

    listen(socket, io) {
        // Test Socket Event
        socket.on('hello', () => socket.emit('hello', 'Hello!'))

        // Check and Create Rooms
        socket.on('checkRooms', (cb) => cb(Rooms.rooms))
        socket.on('createRoom', (roomTitle, cb_client) => {
            Rooms.create(roomTitle, cb_client, gameId => {
                let game = new Game(gameId)
                this.games.push(game)
            })
        })

        // Return Client's Socket ID
        socket.on('getMyId', (cb) => cb(socket.id))

        // Enter the Room
        socket.once('enterRoom', (gameId, cb) => {
            socket.join(gameId)
            cb(gameId)
            
            let game = this.getGame(gameId)
            console.log('[Player Entered a Room]')
        })

        // Register a Player to the Game
        socket.on('addPlayer', (gameId, nickname, cb) => {
            let game = this.getGame(gameId)
            const color = getPlayerColor()
            const defaultCost = 8
            let player = new Player(socket.id, nickname, color, defaultCost)

            game.addPlayer(player)
            console.log('[Player Added]', nickname)
            cb('Added')
        })

        // Game Start
        socket.on('start', (gameId) => {
            let game = this.getGame(gameId)
            game.isStarted = true

            io.to(gameId).emit('start')
            console.log('Start', gameId)
            this.update(gameId, io, 'Game Start')
        })

        // Update All Clients
        socket.on('update', (gameId) => {
            this.update(gameId, io)
        })

        // Update Individual Client
        socket.on('updateEach', (gameId) => {
            this.updateEach(gameId, socket)
        })

        // Occupy a State
        socket.on('occupy', (gameId, myId, stateId) => {
            let game = this.getGame(gameId)
            let player = this.getPlayer(game, myId)
            player.occupyState(game, stateId)

            this.update(gameId, io, 'Occupy')
            console.log('[Occupy]', gameId, player.nickname, stateId)
        })
    }
}

function getPlayerColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16)
}

module.exports = Server