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
          already.status = 'STARTED'
          return steamBot.acceptConfirm(already)
        })
        .then(res => {
          gRes(res)
        })
        .catch(gRej)
    } else {
      if (already.status !== 'STARTED') {
        steamBot.acceptConfirm(already)
          .then(res => {
            gRes(res)
          })
          .catch(gRej)
      } else {
        gRes({
          success: false,
          code: 'ALREADY_IN_QUEUE'
        })
      }

    }
  })
}

module.exports = confirmTrade