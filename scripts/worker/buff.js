
const dealTradeOffer = require('../tradeOffers')
const confirmTrade = require('../confirmation')
const TradeOfferStatus = require('../../const/tradeOfferStatus')
const {
  buffRobot
} = require('../robots')

function checkWithDraw() {
  buffRobot.withdraw()
    .then(() => {
      console.log('buff 取回饰品成功')
    })
    .catch(err => {
      console.log('buff 取回饰品失败', err)
    })
}

function checkSteamTrade() {
  buffRobot.getRobots()
    .then(tradeOffers => {
      if (tradeOffers.length) {
        tradeOffers.forEach(offerInfo => {
          dealTradeOffer(offerInfo)
            .then(_res => {
              if (_res.success) {
                if (_res.data.status === TradeOfferStatus.END) {
                  console.log('交易报价处理完成，无需确认', _res.data)
                } else if (_res.data.status === TradeOfferStatus.NEED_CONFIRM) {
                  console.log('need confirm')
                  confirmTrade(_res.data)
                    .then(confirmRes => {
                      if (confirmRes.success) {
                        console.log(`交易报价：${offerInfo.id}确认成功`, confirmRes)
                      } else {
                        console.log(`交易报价：${offerInfo.id}确认异常`, confirmRes.code)
                      }
                    })
                    .catch(err => {
                      res.json({success: false, err})
                      console.log(`交易报价：${offerInfo.id}确认失败`, err)
                    })
                } else {
                  // console.log(`交易报价：${offerInfo.id}已在队列中`)
                }
              } else {
                console.log(`交易报价：${offerInfo.id}异常`, _res)
              }
            })
            .catch(err => {
              console.trace(`交易报价：${offerInfo.id}处理出错`, err)
            })
        })
      }
    })
    .catch(err => {
      console.log(`获取buff机器人出错`, err)
    })
}

function checkDeliver() {
  buffRobot.deliver()
}

module.exports = {
  checkWithDraw,
  checkSteamTrade,
  checkDeliver
}