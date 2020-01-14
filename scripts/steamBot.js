const SteamRobot = require('../../steamAPI/src/scripts/Steam')
const account = require('../../steamAPI/src/config/accounts/alanderlt')

const robot = new SteamRobot(account)

module.exports = robot
