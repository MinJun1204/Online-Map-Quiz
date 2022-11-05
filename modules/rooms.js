let Rooms = {
    _rooms: [],
    
    get rooms() { return this._rooms },

    create(roomTitle, cb_client, cb_server) {
        let roomId = Math.floor(Math.random() * 900) + 100
    
        console.log(`[Room Created] ${roomTitle} (${roomId})`)
        this.rooms.push({ id: roomId, title: roomTitle })
    
        cb_client(this._rooms)
        cb_server(roomId)
    },

    getPlayerList() {

    },

    chat() {

    }
}

module.exports = Rooms