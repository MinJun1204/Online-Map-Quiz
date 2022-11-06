const fs = require('fs')
const State = require('./state')

class Game {
    constructor(gameId) {
        this.gameId = gameId,
        this.players = [],
        this.playerMap = {},
        this.isStarted = false,
        this.round = 0,
        this.turn = 0
        this.states = this.loadMap()
        
        // socket.emit('createGame', this)
        console.log('[Game Created]', gameId)
    }

    loadMap() {
        const url = 'public/geojson/SIG.geojson'
        const data = JSON.parse(fs.readFileSync(url, 'UTF-8'))

        let states = []
        let features = data.features

        let special = [126, 242, 159, 162, 146, 198, 190, 179, 172, 248, 235, 215, 217]
        let ports = [50, 121, 181, 28, 185, 165, 204]
        let airports = [139, 234, 119, 135, 16, 43]

        features.forEach(element => {
            let state = element.properties
            let neighbors = state.neighbors.split(',').map(item => parseInt(item))
            
            states[state.id] = new State(state.id, state.state, parseInt(state.population), `#${parseInt(state.population / 3500).toString(16)}ffff`, neighbors)
        })
        // features.forEach(element => arr.push(`#${parseInt(element.properties.population / 3500).toString(16)}ffff`))
        // features.forEach((element, idx) => console.log(`${element.properties.state} (${element.properties.population}): rgb(${255 - parseInt(element.properties.population / 3400)}, 255, 255)`))

        special.forEach(e => {
            states[e].addFacility('special')
            // $(`#${e}`).addClass('special')
        })
    
        ports.forEach(e => {
            states[e].addFacility('port')
            // $(`#${e}`).addClass('port')
        })
    
        airports.forEach(e => {
            states[e].addFacility('airport')
            // $(`#${e}`).addClass('airport')
        })
    
        return states
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