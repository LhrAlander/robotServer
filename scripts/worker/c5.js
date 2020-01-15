const {
  c5Robot
} = require('../robots')
const {
  WAIT_DELIVER_QUEUE,
  WAIT_STEAM_QUEUE,
  WAIT_TO_STEAM_QUEUE
} = require('../assets')
const dealTradeOffer = require('../tradeOffers')
const confirmTrade = require('../confirmation')
const TradeOfferStatus = require('../../const/tradeOfferStatus')

// 轮询人工发货订单是否需要取消
function checkPlayerDeliver() {
  c5Robot.checkManualList()
    .then(list => {
      for (let i = 0, l = WAIT_DELIVER_QUEUE.length; i < l; i++) {
        let order = WAIT_DELIVER_QUEUE[i]
        if (list.every(_ => _.id !== order.orderId)) {
          WAIT_TO_STEAM_QUEUE.push(order)
        }
      }
      WAIT_TO_STEAM_QUEUE.forEach(order => {
        WAIT_DELIVER_QUEUE.splice(WAIT_DELIVER_QUEUE.findIndex(_ => _.orderId === order.orderId), 1)
      })
      list.forEach(order => {
        if (order.canCancel) {
          console.log('取消订单', order)
          c5Robot.cancelManualOrder(order.id)
            .then(res => {
              console.log(`cancel order ${order.id} success`, res)
            })
            .catch(err => {
              console.log(`cancel order ${order.id} failed`, err)
            })
        }
      })
    })
    .catch(err => {
      console.log('获取发货列表失败')
    })
}

// 轮询c5背包取回steam
function checkWithDraw() {
  c5Robot.getGoodsInBag()
    .then(items => {
      items.forEach(goods => {
        console.log(`取回饰品：${goods.name}`)
        c5Robot.withdrawGoods(goods.id)
          .then(res => {
            if (res.success) {
              console.log(`取回饰品${goods.name}成功`)
            } else {
              console.log(`取回饰品${goods.name}失败`, res)
            }
          })
          .catch(err => {
            console.log(`取回饰品${goods.name}失败`, err)
          })
      })
    })
}

// 轮询steam报价和确认
function checkSteamTrade() {
  c5Robot.getC5Robots()
    .then(tradeOffers => {
      if (tradeOffers.length) {
        tradeOffers.forEach(tradeOffer => {
          dealTradeOffer(tradeOffer)
            .then(_res => {
              if (_res.success) {
                if (_res.data.status === TradeOfferStatus.END) {
                  console.log(`交易报价：${tradeOffer.id}处理完成，无需确认`)
                } else {
                  console.log('go to confirm')
                  confirmTrade(_res.data)
                    .then(confirmRes => {
                      console.log(`交易报价：${tradeOffer.id}确认成功`, confirmRes)
                    })
                    .catch(err => {
                      console.log(`交易报价：${tradeOffer.id}确认失败`, err)
                    })
                }
              } else {
                console.log(`处理交易报价：${tradeOffer.id}失败`, _res)
              }
            })
            .catch(err => {
              console.log(`交易${tradeOffer.id}报价失败`, err)
            })
        })
      }
    })
}

module.exports = {
  checkPlayerDeliver,
  checkWithDraw,
  checkSteamTrade
}