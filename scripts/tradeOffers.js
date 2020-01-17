const steamRobot = require('./steamBot')
const TradeOfferStatus = require('../const/tradeOfferStatus')
const {TRADE_OFFERS_MAP} = require('./assets')

function patchTradeOfferQueue(newOffers) {
  for (let i = 0, l = newOffers.length; i < l; i++) {
    if (!TRADE_OFFERS_MAP[newOffers[i].id]) {
      TRADE_OFFERS_MAP[newOffers[i].id] = {
        ...newOffers[i],
        status: TradeOfferStatus.UNSTARTED
      }
    }
  }
}

function isSameOffer(target, source) {
  return target.partenerInfo.name === source.partenerInfo.name

}

function acceptTradeOffer(id, pid) {
  return new Promise((res, rej) => {
    steamRobot.acceptTradeOffer(id, pid)
      .then(result => {
        if (result.tradeid) {
          console.log('no need confrim')
          res({success: true, status: TradeOfferStatus.END})
        } else if (!result.tradeid && result['needs_mobile_confirmation']) {
          console.log('need confirm')
          res({
            success: true,
            status: TradeOfferStatus.NEED_CONFIRM
          })
        } else {
          rej(result)
        }
      })
      .catch(err => {
        rej(err)
      })
  })
}

/**
 *
 * @param dealOffer
 * @returns {Promise<unknown>}
 */
function dealTradeOffer(dealOffer) {
  return new Promise((gRes, gRej) => {
    let alreadyExist = TRADE_OFFERS_MAP[dealOffer.id]
    if (alreadyExist) {
      if (alreadyExist.status === TradeOfferStatus.UNSTARTED) {
        alreadyExist.status.status = TradeOfferStatus.STARTED
        acceptTradeOffer(dealOffer.id, dealOffer.pid)
          .then(res => {
            alreadyExist.status = res.status
            gRes({
              success: true,
              data: alreadyExist
            })
          })
          .catch(gRej)
      } else {
        gRes({
          success: true,
          data: 'alreadyExist'
        })
      }
    } else {
      TRADE_OFFERS_MAP[dealOffer.id] = { status: TradeOfferStatus.STARTED }
      // 获取账号下交易报价信息
      steamRobot
        .getAllTradeOffers()
        .then(tradeOffers => {
          patchTradeOfferQueue(tradeOffers)
          let targetOffer = tradeOffers.filter(_ => _.id === dealOffer.id)
          if (!targetOffer.length) {
            gRes({
              success: false,
              code: 'NONE_OFFER'
            })
          } else {
            targetOffer = targetOffer[0]
            if (!isSameOffer(targetOffer, dealOffer)) {
              gRes({
                success: false,
                code: 'DIFF_OFFER'
              })
            } else {
              targetOffer.status = TradeOfferStatus.STARTED
              TRADE_OFFERS_MAP[dealOffer.id] = targetOffer
              acceptTradeOffer(targetOffer.id, targetOffer.pid)
                .then(res => {
                  targetOffer.status = res.status
                  gRes({
                    success: true,
                    data: targetOffer
                  })
                })
                .catch(err => {
                  console.log('accept trade offer err', err)
                  gRej(err)
                })
            }
          }
        })
        .catch(gRej)
    }
  })
}

module.exports = dealTradeOffer
