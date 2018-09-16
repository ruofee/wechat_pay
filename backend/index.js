const Koa = require('koa')
const KoaRouter = require('koa-router')
const BodyParser = require('koa-bodyparser')
const Tenpay = require('tenpay')
const Static = require('koa-static')
const Path = require('path')
const Port = 3000

const app = new Koa()
const router = new KoaRouter()
const wechatConfig = require('./wechatConfig')

app.use(BodyParser({
  enableTypes: ['json', 'form', 'text'],
  extendTypes: {
    text: ['text/xml', 'application/xml']
  },
}))
  .use(Static(
    Path.join( __dirname,  '../frontend')
  ))

router.post('/pay', async (ctx) => {
  let {out_trade_no, total_fee, openid} = ctx.request.body
  let wechatApi = new Tenpay(wechatConfig)
  let wechatParam = {
    openid,
    trade_type: 'JSAPI',
    out_trade_no, //商户内部订单号
    body: '测试微信公众号支付',
    total_fee: total_fee * 100, //订单金额(单位：分)
  }
  let result = await wechatApi.getPayParams(wechatParam)
  ctx.response.status = 200
  ctx.response.body = result
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(Port, () => {
  console.log(`run in localhost: ${Port}`)
})