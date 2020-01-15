const TRADE_OFFERS_MAP = {}
const CONFIRMS = []

// 等待卖家发货的订单队列
const WAIT_DELIVER_QUEUE = []
// 等待交易完成的饰品队列
const WAIT_STEAM_QUEUE = []
// 等待从背包取号steam库存队列
const WAIT_TO_STEAM_QUEUE = []

module.exports = {
  TRADE_OFFERS_MAP,
  CONFIRMS,
  WAIT_DELIVER_QUEUE,
  WAIT_STEAM_QUEUE,
  WAIT_TO_STEAM_QUEUE
}