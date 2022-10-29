let socket = io()
let server
let myId

const url = './geojson/SIG.geojson'

let players = []
let playerMap = {}
let second, minute

let states = []
let special = [126, 242, 159, 162, 146, 198, 190, 179, 172, 248, 235, 215, 217]
let ports = [50, 121, 181, 28, 185, 165, 204]
let airports = [139, 234, 119, 135, 16, 43]

class Server {
    players = []
    playerMap = {}

    constructor(players, states) {
        this.players = players
        this.states = states
        this.round = 0
        this.turn = 0

        console.log('[Server Created]')
    }

    set players(players) { this.players = players }
    get players() { return this.players }
    
    set playerMap(playerMap) { this.playerMap = playerMap }
    get playerMap() { return this.playerMap }

    addPlayer(player) {
        this.players.push(player)
        this.playerMap[player.id] = player
    }

    nextRound() { round++ }
    
    nextTurn() {
        if (this.turn == 0) this.turn++
        else {
            this.turn = 0
            this.round++
        }
    }
}

class Player {
    constructor(id, color, nickname) {
        this.id = id
        this.nickname = nickname
        this.color = color
        this.occupied = []
        this.neighbors = new Set()
        this.inSight = new Set()
        this.score = 0
        this.special = 0
        this.port = 0
        this.airport = 0
        this.airportScore = 0
        this.grow = 0
    }
}

class State {
    constructor(name, population, color, neighbors, facilities) {
        this.name = name
        this.population = population
        this.color = color
        this.neighbors = neighbors
        this.facilities = facilities
    }
}

/* Main Function */
$(document).ready(async () => {
    server = createServer()
    game()
    preload()

    checkUpdate()

    let toggle = false

    $('#population').click(() => {
        if (toggle) {
            $('path').css('fill', '#ffffff')
            toggle = true
        } else {
            states.forEach((element, idx) => $(`#${idx}`).css('fill', `rgb(${255 - parseInt(element.population / 3400)}, 255, 255)`))
            toggle = false
        }
    })
})

function createServer() {
    let server = new Server([], [])

    return server
}

function checkUpdate() {
    socket.on('update', (server) => {
        server = server
        console.log('[Update]', server)
    })
}

function update() {
    socket.emit('update', server)
}

function joinUser(id, color, nickname) {
    let player = new Player(id, color, nickname)

    server.addPlayer(player)
    update()

    // players.push(player)
    // playerMap[id] = player

    // return player
}

function leaveUser(id) {
    // for (let i = 0; i < players.length; i++) {
    //     if (players[i].id == id) {
    //         players.splice(i, 1)
    //         break
    //     }
    //     delete playerMap[id]
    // }

    let playerList = server.players
    for (let i = 0; i < playerList.length; i++) {
        if (playerList[i].id == id) {
            playerList.splice(i, 1)
            break
        }
        delete server.playerMap[id]
    }
    update()
}


/* User Management */

// Get My ID
socket.on('userId', (data) => {
    myId = data
    console.log('My ID :', myId)
})

// Join User
socket.on('joinUser', (data) => {
    if (data.id == myId) {
        $('#players').append(`<li id="${data.id}" style="font-weight: bold; color: ${data.color}">${data.nickname} (나) : 0 / 0 (0%)</li>`)
    } else {
        $('#players').append(`<li id="${data.id}" style="font-weight: bold; color: ${data.color}">${data.nickname} : 0 / 0 (0%)</li>`)
    }

    console.log('[Join User]', data)
    joinUser(data.id, data.color, data.nickname)
})

// Leave User
socket.on('leaveUser', (id) => leaveUser(id))

function getMapData(url) {
    return new Promise((resolve, reject) => {
        $.getJSON(url, (response) => {
            if (response) resolve(response)
            else reject(new Error('Request failed'))
        })
    })
}

function parseMapData(data) {
    let states = []
    let features = data.features

    features.forEach(element => {
        let state = element.properties
        let neighbors = state.neighbors.split(',').map(item => parseInt(item))
        
        states[state.id] = new State(state.state, parseInt(state.population), `#${parseInt(state.population / 3500).toString(16)}ffff`, neighbors)
    })
    // features.forEach(element => arr.push(`#${parseInt(element.properties.population / 3500).toString(16)}ffff`))
    // features.forEach((element, idx) => console.log(`${element.properties.state} (${element.properties.population}): rgb(${255 - parseInt(element.properties.population / 3400)}, 255, 255)`))

    return states
}

/* UI */
function preload() {
    customize()
    chat()
    cursor()
}

function customize() {
    $('#customize').submit((e) => {
        e.preventDefault()
        let nickname = $('#nickname').val()
        let color = $('#color').val()

        if (nickname) {
            server.playerMap[myId].nickname = nickname
            server.playerMap[myId].color = color
            update()

            $('section:has(#customize)').hide()
        } else {
            alert('닉네임을 입력하세요')
        }
    })
}

function chat() {
    $('#chat').submit((e) => {
        e.preventDefault()
        if ($('#chat input').val()) {
            socket.emit('chat', myId, $('#chat input').val())
            $('#chat input').val('')
        }
    })

    $('#clear').click(() => {
        $('#messages *').hide()
    })
}

function cursor() {
    $(document).on('mousemove', 'path', (e) => {
        $('#cursor').css('display', 'auto').text(`${states[e.target.id].name} (${states[e.target.id].population})${stateNeighborEmoji(states[e.target.id])}`)
        $('#cursor').css('left', e.pageX + 15).css('top', e.pageY)
    })

    $(document).on('mouseenter', 'path', e => {
        states[e.target.id].neighbors.forEach(idx => {
            if (e.target.id == idx) return
            if ($(`#${idx}`).hasClass('occupied')) return
            $(`#${idx}`).addClass('neighbor')
        })
    })

    $(document).on('mouseleave', 'path', e => {
        states[e.target.id].neighbors.forEach(idx => {
            $(`#${idx}`).removeClass('neighbor')
        })
    })
}

function timeUpdate() {
    second++
    if (second >= 60) {
        minute++
        second = 0
    }
    $('#timer').text(`${minute}:${second}`)
}

async function game() {
    $('header, main, #question').hide()
    $('#colorpicker').farbtastic('#color')

    socket.on('customize', (id, nickname, color) => {
        if (id === myId)
            $(`#${id}`).text(`${nickname} (나) : 0`)
        else
            $(`#${id}`).text(`${nickname} : 0`)
        
        $(`#${id}`).css('color', color)

        playerMap[id].nickname = nickname
        playerMap[id].color = color
    })

    socket.on('chat', (id, msg) => {
        $('#messages').append(`<li>[${playerMap[id].nickname}] ${msg}</li>`)
    })

    let timer
    
    // let states = []
    let neighbors = []
    let qNum
    let myScore = 0
    let opScore = 0
    let order = 0
    let myTurn = true

    let data = await getMapData(url)
    states = parseMapData(data)

    special.forEach(e => {
        states[e].special = true
        $(`#${e}`).addClass('special')
    })

    ports.forEach(e => {
        states[e].port = true
        $(`#${e}`).addClass('port')
    })

    airports.forEach(e => {
        states[e].airport = true
        $(`#${e}`).addClass('airport')
    })

    console.log('States :', states)

    $('#start').click(() => {
        socket.emit('start', states)
    })

    socket.on('start', () => {
        console.log('[Players]', players, playerMap)
        $('#settings').hide()
        $('header, main').show()

        second = 0, minute = 0
        timer = setInterval(timeUpdate, 1000)
    })

    socket.on('correct', (id, index) => {
        // playerMap[id].score += states[index].population
        console.log('[Occupied]', id, index, playerMap[id].score)

        // $(`#${id}`).text($(`#${id}`).text().split(':')[0] + ': ' + playerMap[id].score)
        $(`#${index}`).css('fill', playerMap[id].color).removeClass('special port airport')
    })

    socket.on('myCorrect', (index) => {
        opScore++
        $('#score').text(`내 점수: ${myScore} | 상대 점수 : ${opScore} |`)
        // $(`#states path:eq(${index - 1})`).addClass('opCorrect')
    })

    socket.on('end', () => {
        clearInterval(timer)
        $('#timer').text($('#timer').text() + ' [종료]')
    })

    socket.on('turnEnd', () => {
        $('#turn').show()
        myTurn = true

        let me = playerMap[myId]
        me.score *= 1 + me.grow / 200
        me.score = parseInt(me.score)
        me.airportScore += me.airport


        socket.emit('refresh', playerMap)

        console.log('[Grow]', me.id, me.score, me.airportScore)
    })

    socket.on('refresh', (_playerMap, index) => {
        playerMap = _playerMap
        // let player = playerMap[id]

        for (let i in playerMap) {
            let player = playerMap[i]
            
            player.neighbors = new Set()
            player.inSight = new Set()

            player.occupied.forEach(e => {
                $(`#${e}`).css('fill', player.color).removeClass('special port airport').addClass('occupied')

                states[e].neighbors.forEach(f => player.neighbors.add(f))
            })

            player.neighbors.forEach(e => {
                states[e].neighbors.forEach(f => {
                    player.inSight.add(f)
                })
            })

            $(`#${player.id}`).text(`${player.nickname} : ${player.score} / ${player.special} / ${player.port} / (${player.grow}% / ${player.airport} / ${player.airportScore})`)
        }   

        playerMap[myId].neighbors.forEach(e => $(`#${e}`).removeClass('fog'))
        
        console.log('[Refresh]', playerMap)

        // player.grow = player.special * player.port
        // player.score *= 1 + player.grow / 100

        // player.score += states[index].population
        
    })
    
    $('#skip').click(() => {
        socket.emit('turnEnd')
        order = 0
        myTurn = false
        $('#turn').hide()
    })

    $(document).on('click', 'path', function(){
        let me = playerMap[myId]
        
        if (myTurn == true) {
            order++

            console.log(`[Clicked] ${this.id} / Order ${order}`)

            me.occupied.push(parseInt(this.id))
            me.score += states[this.id].population
            // me.score += states[this.id].population

            if (states[this.id].special) {
                me.special += 1
                // me.score *= 1.1
                // me.score = parseInt(me.score)

                if (states[this.id].name === '의성') {
                    alert(`<의성 마늘>\n신웅이 신령스러운 쑥 한 타래와 마늘 20개를 주면서 이르기를 “너희들이 이것을 먹고 백일 동안 햇빛을 보지 아니하면 곧 사람이 될 것이다.”라고 하였다.\n\n-삼국유사-\n\n내가 가진 모든 도시에 턴당 생산 점수 +2% 부여`)
                }
            }

            if (states[this.id].port) {
                me.port += 1
            }

            if (states[this.id].airport) {
                me.airport += 1
            }

            me.grow = me.special * me.port * 0.5

            socket.emit('refresh', playerMap)

            $('#turn').hide()

            if (order == 2) {
                myTurn = false
                order = 0
                socket.emit('turnEnd')
            }
        }
    })
}

function stateNeighborEmoji(state) {
    if (state.special) return "🎁"
    if (state.port) return "🚢"
    if (state.airport) return "✈️"
    return ""
}