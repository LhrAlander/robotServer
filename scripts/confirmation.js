const steamBot = require('./steamBot')
const {CONFIRMS} = require('./assets')

function findOfferFromCache(target) {
  let res = false
  for (let i = 0, l = CONFIRMS.length; i < l; i++) {
    let source = CONFIRMS[i]
    if (source.partenerInfo.name !== target.partenerInfo.name) {
      continue
    }
    if (
      source.receiveItems.length !== target.receiveItems.length ||
      source.giveItems.length !== target.giveItems.length
    ) {
      continue
    }
    if (
      !source.receiveItems.every(sItem => target.receiveItems.some(tItem => tItem.name === sItem.name)) ||
      !source.giveItems.every(sItem => target.giveItems.some(tItem => tItem.name === sItem.name))
    ) {
      continue
    }
    res = source
    break
  }
  return res
}

function patchConfirms(confirms) {
  confirms.forEach(_ => {
    if (!findOfferFromCache(_)) {
      CONFIRMS.push(_)
    }
  })
}

function confirmTrade(offer) {
  console.log('confirm offer', offer)
  return new Promise((gRes, gRej) => {
    let already = findOfferFromCache(offer)
    if (!already) {
      steamBot
        .fetchAllConfirms()
        .then(confirms => {
          patchConfirms(confirms)
          already = findOfferFromCache(offer)
          if (!already) {
            return gRes({
              success: false,
              code: 'NONE_CONFIRMATION'
            })
          }
          return steamBot.acceptConfirm(already)
        })
        .then(res => {
          console.log(res)
          gRes(res)
        })
        .catch(gRej)
    } else {
      steamBot.acceptConfirm(already)
        .then(res => {
          console.log(res)
          gRes(res)
        })
        .catch(gRej)
    }
  })
}

module.exports = confirmTrade