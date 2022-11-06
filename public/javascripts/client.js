let Client = {}
const socket = io()
let myId
let game

$(document).ready(function() {
    init()
    onGame()
})