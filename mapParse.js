const fs = require('fs')

const url = 'public/geojson/SIG.geojson'
const file = fs.readFileSync(url, 'UTF-8')
const data = JSON.parse(file)

let states = []
let features = data.features

let special = [126, 242, 159, 162, 146, 198, 190, 179, 172, 248, 235, 215, 217]
let ports = [50, 121, 181, 28, 185, 165, 204]
let airports = [139, 234, 119, 135, 16, 43]

features.forEach(e => {
    // let state = { props: undefined, coordinates: undefined}
    // let props = element.properties
    // let coordinates
    // let neighbors = props.neighbors.split(',').map(item => parseInt(item))
    
    // let state = {
    //     properties: {
    //         id: props.id,
    //         name: props.state,
    //         population: props.population,
    //         owner: null,
    //         neighbors: neighbors,
    //     },
    //     coordinates: coordinates
    // }

    // states[props.id] = state

    // console.log(e.geometry.coordinates[0])

    let coordinates = e.geometry.coordinates[0][0]
    for (let coordinate of coordinates) {
        coordinate[0] = parseFloat(coordinate[0].toFixed(4))
        coordinate[1] = parseFloat(coordinate[1].toFixed(4))
    }
})

fs.writeFileSync('public/geojson/newSIG.geojson', JSON.stringify(data))

// console.log(features[0].geometry.coordinates[0][0][0])