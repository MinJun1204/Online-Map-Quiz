class State {
    constructor(id, name, population, color, neighbors, facilities) {
        this.id = id
        this.name = name
        this.population = population
        this.color = color
        this.neighbors = neighbors
        this.facilities = {
            special: false,
            port: false,
            airport: false
        }
        this.owner = null
        this.troops = 0
    }

    addFacility(facility) {
        if (this.facilities[facility] == true)
            alert(`${facility} already constructed`)
        else this.facilities[facility] = true
    }
}

module.exports = State