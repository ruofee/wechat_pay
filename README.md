# wechat_pay

> 微信公众号支付demo
>
> 微信官方的公众号支付: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_1
>
> 这几天在搞微信公众号支付, 因为微信支付的文档写得并不是很好, 所以也踩了很多坑, 所以在这里写个demo, 做一些简单的流程分析

所谓微信公众号支付, 就是使用微信自带的浏览器进行微信支付操作, 这有别于H5支付(使用移动端非微信的浏览器进行微信支付操作), 正常使用微信公众号支付大致为以下流程: 

1. 注册并获取公众号的基本信息: 如appid, mchid等

2. 获取openid: 对应公众号, 每个用户都有一个唯一的openid

3. 调出支付窗口

附上一张官方的流程图:

![](https://pay.weixin.qq.com/wiki/doc/api/img/chapter7_4_1.png)

第一步比较简单, 所以这里只讨论第二和第三步, 因此默认已经获得以下参数:

```js
[appid, mchid, appsecret]
```

第二步(获取openid)

1. 用户同意授权或是静默授权, 获取code

   跳转到链接: `https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect`

   请求参数:

   | 参数             | 是否必须 | 说明                                                         |
   | ---------------- | -------- | ------------------------------------------------------------ |
   | appid            | 是       | 公众号的唯一标识                                             |
   | redirect_uri     | 是       | 授权后重定向的回调链接地址， 请使用 urlEncode 对链接进行处理 |
   | response_type    | 是       | 返回类型，请填写code                                         |
   | scope            | 是       | 应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权窗口，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ） |
   | state            | 否       | 重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节 |
   | #wechat_redirect | 是       | 无论直接打开还是做页面302重定向时候，必须带此参数            |

   PS: scope有两个值, snsapi_base为静默授权, 并不会弹出任何提示, 用户在没有察觉的情况下就跳转到了redirect_uri了, 但该权限比较低, 只能获取用户的openid(没关注公众号的情况下), 若是关注了该公众号则可以获取用户的个人信息(如何获取, 请自行google), snsapi_userinfo为弹出授权窗口(若是关注了公众号则不会弹出授权窗口, 经过测试: 临时取消公众号也不会弹出授权窗口)

   用户授权或是静默授权之后会跳转到: `redirect_uri/?code=CODE&state=STATE`, query上的CODE字段为我们所要得到的code

2. 使用code换取access_token和openid

   请求该地址: `https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code`

   请求参数:

   | 参数       | 是否必须 | 说明                     |
   | ---------- | -------- | ------------------------ |
   | appid      | 是       | 公众号的唯一标识         |
   | secret     | 是       | 公众号的appsecret        |
   | code       | 是       | 填写第一步获取的code参数 |
   | grant_type | 是       | 填写为authorization_code |

   返回参数为:

   | 参数          | 描述                                                         |
   | ------------- | ------------------------------------------------------------ |
   | access_token  | 网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同 |
   | expires_in    | access_token接口调用凭证超时时间，单位（秒）                 |
   | refresh_token | 用户刷新access_token                                         |
   | openid        | 用户唯一标识，请注意，在未关注公众号时，用户访问公众号的网页，也会产生一个用户和公众号唯一的OpenID |
   | scope         | 用户授权的作用域，使用逗号（,）分隔                          |

3. 若是scope为`snsapi_userinfo`, 则可以获取到用户的基本信息(使用openid和access_token)

   请求该地址: `https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN`

   请求参数为:

   | 参数         | 描述                                                         |
   | ------------ | ------------------------------------------------------------ |
   | access_token | 网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同 |
   | openid       | 用户的唯一标识                                               |
   | lang         | 返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语        |

   返回参数为:

   | 参数       | 描述                                                         |
   | ---------- | ------------------------------------------------------------ |
   | openid     | 用户的唯一标识                                               |
   | nickname   | 用户昵称                                                     |
   | sex        | 用户的性别，值为1时是男性，值为2时是女性，值为0时是未知      |
   | province   | 用户个人资料填写的省份                                       |
   | city       | 普通用户个人资料填写的城市                                   |
   | country    | 国家，如中国为CN                                             |
   | headimgurl | 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。 |
   | privilege  | 用户特权信息，json 数组，如微信沃卡用户为（chinaunicom）     |
   | unionid    | 只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。 |

4. 调起支付窗口的两种方法:

   1. 调用wx的API
   2. 使用微信内置对象: WeixinJSBridge

   该demo使用第二种方法, 使用nodejs做一些签名(如paySign字段)的处理(由前端处理会过于沉重), 之后再返回给前端, 然后前端再调用WeixinJSBridge实现支付;

   简化流程: 项目使用三方包[node-tenpay](https://github.com/befinal/node-tenpay)

   1. 前端请求后端接口

      接口: `/api/pay`

      类型: `POST`

      body: 

      ```json
      {
          "openid": String,
          "out_trade_no": String,
          "total_fee": String
      }
      ```

      *PS*:

      1. `out_trade_no`为商品内部订单号, `total_fee`为订单金额
      2. 商户系统内部订单号: 要求32个字符内，只能是数字、大小写字母_-|*, 且在同一个商户号下唯一。详见[商户订单号](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_2)
      3. 订单总金额，单位为分，只能为整数，详见[支付金额](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_2)

   2. 后端调用tenpay模块的getPayParams方法, tenpay执行一系列处理之后返回以下参数:

      ```json
      {
          "appId": String,
      	"timeStamp": String,
      	"nonceStr": String,
      	"package": String,
      	"signType": String,
      	"paySign": String //重点: 支付签名(后端执行算法操作, 得出的结果)
      }
      ```

      以及有部分没有使用到的参数没有列出来

   3. 前端拿到后端返回的参数之后, 调用WeixinJSBridge对象的invoke方法调出支付窗口

      ```js
      const onBridgeReady = () => {
          WeixinJSBridge.invoke('getBrandWCPayRequest', {
              appId, //公众号名称，由商户传入
              timeStamp, //时间戳，自1970年以来的秒数, 需要与后端返回的一致
              nonceStr, //随机串
              package: packageStr, //注意, package为预留字段, 不能作为变量名
              signType, //签名类型
              paySign, //支付签名
          }, function (res) {
              if(res.err_msg === "get_brand_wcpay_request:ok" ){
                  // 使用以上方式判断前端返回,微信团队郑重提示：
                  //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
              }
          })
      }
      if (typeof WeixinJSBridge === "undefined") {
          // WeixinJSBridge 注册再调用 onBridgeReady
          if (document.addEventListener) {
              document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
          } else if (document.attachEvent) {
              document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
              document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
          }
      } else {
          onBridgeReady()
      }
      ```

      PS: 支付签名(paySign)生成算法的详细介绍: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3

