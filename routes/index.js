var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  if (req.cookies.id) res.redirect('/lobby')

  res.render('index', { title: 'Online Map Quiz' })
})

router.get('/lobby', (req, res) => {
  res.render('lobby', { id: req.cookies.id })
})

router.post('/login', (req, res) => {
  res.cookie('id', req.body.id).redirect('lobby')
})

router.get('/logout', (req, res) => {
  res.clearCookie('id').redirect('/')
})

router.get('/game/:gameId', (req, res) => {
  let gameId = req.params.gameId
  console.log('[Game Entered]', gameId)

  res.render('game', { nickname: req.cookies.id, gameId: gameId })
})

module.exports = router;
