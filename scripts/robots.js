const C5Robot = require('../../game/src/robots/c5')
const BuffRobot = require('../../game/src/robots/buff')

const steamBot = require('./steamBot')

const c5Robot = new C5Robot(steamBot)
const buffRobot = new BuffRobot(steamBot)

module.exports = {
  c5Robot,
  buffRobot
}
