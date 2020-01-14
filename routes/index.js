const express = require('express')
const router = express.Router()
const dealTradeOffer = require('../scripts/tradeOffers')
const TradeOfferStatus = require('../const/tradeOfferStatus')
const confirmTrade = require('../scripts/confirmation')
/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('请输入对应指令')
})

/**
 * 处理交易报价
 * id,
 * partnerName,
 */
router.post('/deal/trade', function (req, res, next) {
  const offerInfo = req.body.offerInfo
  offerInfo.id = offerInfo.id + ''
  console.log('hello', offerInfo)
  dealTradeOffer(offerInfo)
    .then(_res => {
      console.log(_res)
      if (_res.success) {
        if (_res.data.status === TradeOfferStatus.END) {
          res.send('交易报价处理完成，无需确认')
        } else {
          console.log('go to confirm')
          confirmTrade(_res.data)
            .then(confirmRes => {
              res.send(confirmRes)
            })
            .catch(err => {
              res.send(err)
            })
        }
      } else {
        res.json(_res)
      }
    })
    .catch(err => {
      res.send(err)
    })
})

module.exports = router
