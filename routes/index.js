var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  if (req.cookies.id != undefined) res.redirect('/lobby')

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

router.get('/game', (req, res) => {
  res.render('game', { id: req.cookies.id })
})

module.exports = router;
