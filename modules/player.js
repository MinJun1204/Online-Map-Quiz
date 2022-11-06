class Player {
    constructor(id, nickname, color) {
        this.id = id
        this.nickname = nickname
        this.color = color
        this.occupied = []
        // this.neighbors = new Set()
        // this.inSight = new Set()
        // this.score = 0
        this.population = 0
        this.facilities = {
            special: 0,
            port: 0,
            airport: 0
        }
        this.airportScore = 0
        this.grow = 0
    }

    occupyState(game, stateId) {
        let state = game.states[stateId]

        if (state.owner !== null) return
        state.owner = this
        
        this.occupied.push(stateId)
        this.population += state.population

        if (state.facilities.special) this.facilities.special++
        if (state.facilities.port) this.facilities.port++
        if (state.facilities.airport) this.facilities.airport++

        game.nextTurn()

        // log(`[Occupied] ${state.name} (${state.id}) : ${me.nickname}`)

        /*
        if (state.facilities.special) this.facilities.special++
        else if (state.facilities.port) this.facilities.port++
        else if (state.facilities.airport) this.facilities.airport++

        this.population += state.population
        */
    }
}

module.exports = Player