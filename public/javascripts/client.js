let Client = {}
const socket = io()
let myId
let game

$(document).ready(async function() {
    checkUpdate()

    init()
    onGame()
})