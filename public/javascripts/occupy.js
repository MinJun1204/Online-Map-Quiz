let players = []
let playerMap = {}
let myId
let second, minute

function Player(id, color, nickname) {
    this.id = id
    this.nickname = nickname
    this.color = color
    this.score = 0
}

function State(id, name, people) {
    this.id = id
    this.name = name
    this.people = people
}

function joinUser(id, color, nickname) {
    let player = new Player(id, color, nickname)

    players.push(player)
    playerMap[id] = player

    return player
}

function leaveUser(id) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].id == id) {
            players.splice(i, 1)
            break
        }
        delete playerMap[id]
    }
}

let socket = io()

socket.on('userId', (data) => {
    myId = data
    console.log(myId)
})
socket.on('joinUser', (data) => {
    if (data.id == myId) {
        $('#players').append(`<li id="${data.id}" style="font-weight: bold; color: ${data.color}">${data.nickname} (나) : 0</li>`)
    } else {
        $('#players').append(`<li id="${data.id}" style="font-weight: bold; color: ${data.color}">${data.nickname} : 0</li>`)
    }

    console.log(data)
    joinUser(data.id, data.color, data.nickname)
})

socket.on('leaveUser', (id) => leaveUser(id))

let url = '/geojson/SIG.geojson'

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

    features.forEach((element, index) => states.push(new State(index, element.properties.도시지역_인구현황_시군구__20210821234950_field_5, parseInt(element.properties.도시지역_인구현황_시군구__20210821234950_field_6))))
    return states
}

function customize() {
    $('#customize').submit((e) => {
        e.preventDefault()
        if ($('#nickname').val()) {
            socket.emit('customize', myId, $('#nickname').val(), $('#color').val())
            $('#customize').hide()
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
    $('main, #timer').hide()
    $('#colorpicker').farbtastic('#color')

    customize()
    chat()    

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
    let turn = 1
    let order = 0
    let myTurn = true

    let data = await getMapData(url)
    let states = parseMapData(data)
    console.log('States :', states)

    $('#start').click(() => {
        socket.emit('start', states)
    })

    socket.on('start', () => {
        console.log(players, playerMap)
        $('h2, #start, #mapSelect, label[for="mapSelect"], #leaderboard, #modeSelect, #question, label[for="modeSelect"]').hide()
        $('main, #timer').show()

        second = 0, minute = 0
        //timer = setInterval(timeUpdate, 1000)
    })

    socket.on('newQuestion', (num) => {
        qNum = num
        $('#question').text(states[qNum])
        $('path').removeClass('wrong').removeClass('hint')
    })

    socket.on('hint', hintList => {
        hintList.forEach(index => {
            $(`#states path:eq(${index})`).addClass('hint').removeClass('wrong')
        })
    })

    socket.on('correct', (id, index) => {
        playerMap[id].score++;
        console.log(id, index)

        $(`#${id}`).text($(`#${id}`).text().split(':')[0] + ': ' + playerMap[id].score)
        $(`#states path:eq(${index - 1})`).css('fill', playerMap[id].color).removeClass('hint')
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
    socket.on('turn', () => {
        turn++
    })
        socket.on('turnEnd', () => {

        $('#turn').show()
        myTurn = true
    })
    
    $('#skip').click(() => {
        socket.emit('turnEnd')
        order = 0
        myTurn = false
        $('#turn').hide()
    })

    $(document).on('click', 'path', function(){
        if (myTurn == true) {
            order++

            if (order == 1) {
                if (states[$(this).index()][1]) {
                    myScore+=states[$(this).index()][1]
                }
                socket.emit('correct', myId, $(this).index())
                $('#turn').hide()
            } else if (order == 2) {
                if (states[$(this).index()][1]) {
                    myScore+=states[$(this).index()][1]
                }
                socket.emit('correct', myId, $(this).index())
                $('#turn').hide()

                myTurn = false
                order = 0
                socket.emit('turnEnd')
                socket.emit('turn')
            }
        }
        $('#current').text(`클릭: ${this.id}`)
        console.log(order)
        $('#timer').text(`내 점수: ${myScore} | 상대 점수 : ${opScore} | 턴 : ${turn}`)
    })
}

$(document).ready(game)