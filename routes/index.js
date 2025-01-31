const express = require('express')
const router = express.Router()
const dealTradeOffer = require('../scripts/tradeOffers')
const TradeOfferStatus = require('../const/tradeOfferStatus')
const confirmTrade = require('../scripts/confirmation')
const {
  buyGoods,
  QUICK_BUY,
  MANUAL_BUY,
  NO_PROFIT,
  FETCH_PRICE_ERR
} = require('../scripts/buyGoods')

const {
  c5Robot,
  buffRobot
} = require('../scripts/robots')


/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('请输入对应指令')
})


/**
 * 买饰品
 * platform,
 * detail
 */
router.post('/buy', function (req, res, next) {
  const {platform, detail} = req.body
  Promise.all([
    c5Robot.getPriceInfo(detail.c5Id),
    buffRobot.getPriceInfo(detail.buffId)
  ])
    .then(([sellPlatform, purchasePlatform]) => {
      let quickPrice = Number.MAX_SAFE_INTEGER
      let manualPrice = Number.MAX_SAFE_INTEGER
      let purchasePrice = -1
      if (platform === 'buff') {
        [purchasePlatform, sellPlatform] = [sellPlatform, purchasePlatform]
      }
      if (purchasePlatform.purchase) {
        purchasePrice = +purchasePlatform.purchase.price
      }
      if (sellPlatform.manual) {
        manualPrice = +sellPlatform.manual.price
      }
      if (sellPlatform.quick) {
        quickPrice = +sellPlatform.quick.price
      }
      let sellPrice = quickPrice
      let type = QUICK_BUY
      if (purchasePrice * 0.982 - manualPrice > 0) {
        type = MANUAL_BUY
        sellPrice = manualPrice
      } else if (purchasePrice * 0.982 - quickPrice < 0) {
        return res.json({
          success: false,
          code: NO_PROFIT,
          data: {
            sellPrice: Math.min(manualPrice, quickPrice),
            purchasePrice
          }
        })
      }

      buyGoods({
        platform,
        type,
        detail: sellPlatform,
        info: type === QUICK_BUY ? sellPlatform.quick : sellPlatform.manual
      })

      return res.json({
        success: true,
        data: {
          platform,
          type,
          sellPrice,
          purchasePrice
        }
      })

    })
    .catch(err => {
      console.log('问题', err)
      res.json({
        success: false,
        code: FETCH_PRICE_ERR,
        data: err
      })
    })
})
module.exports = router
