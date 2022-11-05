let Rooms = {
    _rooms: [],
    
    get rooms() { return this._rooms },

    create(roomTitle, cb) {
        let roomId = Math.floor(Math.random() * 900) + 100
    
        console.log(`[Room Created] ${roomTitle} (${roomId})`)
        this.rooms.push({ id: roomId, title: roomTitle })
    
        cb(this._rooms)
    }
}

module.exports = Rooms