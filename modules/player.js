class Player {
    constructor(id, color, nickname) {
        this.id = id
        this.nickname = nickname
        this.color = color
        this.occupied = []
        this.neighbors = new Set()
        this.inSight = new Set()
        this.score = 0
        this.population = 0
        this.facilities = {
            special: 0,
            port: 0,
            airport: 0
        }
        this.airportScore = 0
        this.grow = 0
    }

    occupyState(state) {
        state.owner = me
        me.occupied.push(state)
        log(`[Occupied] ${state.name} (${state.id}) : ${me.nickname}`)

        if (state.facilities.special) me.facilities.special++
        else if (state.facilities.port) me.facilities.port++
        else if (state.facilities.airport) me.facilities.airport++

        this.population += state.population
    }
}

module.exports = Player