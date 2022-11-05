class Game {
    constructor(gameId) {
        this.gameId = gameId,
        this.players = [],
        this.playerMap = {},
        this.isStarted = false,
        this.round = 0,
        this.turn = 0
        
        // socket.emit('createGame', this)
        console.log('[Game Created]', gameId)
    }

    addPlayer(player) {
        this.players.push(player)
        this.playerMap[player.id] = player
    }

    nextRound() { this.round++ }

    nextTurn() {
        if (this.turn == 0) this.turn++
        else {
            this.turn = 0
            this.round++
        }
    }
}

module.exports = Game