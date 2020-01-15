const {
  c5Robot,
  buffRobot
} = require('./robots')

const {
  WAIT_STEAM_QUEUE,
  WAIT_DELIVER_QUEUE
} = require('./assets')


const QUICK_BUY = 0
const MANUAL_BUY = 1
const NO_PROFIT = 2
const FETCH_PRICE_ERR = 3

function buyGoods({platform, type, detail, info}) {
  if (platform === 'c5') {
    buyGoodsFromC5({
      type,
      name: info.name,
      id: info.url.match(/id=(\d*)/)[1]
    })
      .then(info => {
        if (info.success) {
          console.log('下单成功')
        } else if (!info.success) {
          console.log('出现问题', info)
        }
      })
      .catch(err => {
        console.log('下单失败', err)
      })
  }
}

function buyGoodsFromC5(info) {
  return new Promise((gRes, gRej) => {
    c5Robot.buyGoods(info.id)
      .then(orderInfo => {
        if (info.type === QUICK_BUY) { // c5 极速发货
          c5Robot.sendTradeOffer(orderInfo.orderId)
            .then(trade => {
              console.log('发送交易报价成功', trade)
              WAIT_STEAM_QUEUE.push({
                receiveItems: [{name: info.name}]
              })
              gRes({
                success: true
              })
            })
            .catch(err => {
              console.log('发送交易报价失败', err)
              gRes({
                success: false,
                msg: '发送交易报价失败',
                err
              })
            })
        } else { // c5 人工发货
          WAIT_DELIVER_QUEUE.push({
            receiveItems: [{name: info.name, orderId: orderInfo.orderId}]
          })
          gRes({
            success: true
          })
        }
      })
      .catch(err => {
        gRej({
          success: false,
          msg: '下单失败',
          err
        })
      })
  })
}

module.exports = {
  buyGoods,
  QUICK_BUY,
  MANUAL_BUY,
  NO_PROFIT,
  FETCH_PRICE_ERR
}