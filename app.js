const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')

const {
  checkPlayerDeliver,
  checkWithDraw,
  checkSteamTrade,
  checkDeliver: c5Deliver,
  checkPurchaseDeliver: c5PurchaseDeliver
} = require('./scripts/worker/c5')

const {
  checkWithDraw: buffWithDraw,
  checkSteamTrade: buffSteamTrade,
  checkDeliver: buffDeliver
} = require('./scripts/worker/buff')

const app = express()
setInterval(checkPlayerDeliver, 10000)
setInterval(checkWithDraw, 15000)
setInterval(buffWithDraw, 15000)
setInterval(checkSteamTrade, 5000)
setInterval(buffSteamTrade, 5000)
setInterval(buffDeliver, 10000)
setInterval(c5Deliver, 10000)
setInterval(c5PurchaseDeliver, 10000)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
