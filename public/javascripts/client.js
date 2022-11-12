let Client = {}
const socket = io()
let myId, myOrder
let game

$(document).ready(function() {
    init()
    onGame()
})