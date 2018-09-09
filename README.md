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
[appid, mchid, key]
//注: 这里的key是商户的key
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

   PS: scope有两个值, snsapi_base为静默授权, 并不会弹出任何提示, 用户几乎不会发现, 但只能获取用户的openid(没关注公众号的情况下, 若是关注了可以获取用户的个人信息, 详情请google), snsapi_userinfo为弹出授权窗口(若是关注了公众号则不会弹出授权窗口, 但权限和弹出授权窗口相同, 经过测试: 临时取消公众号也不会弹出授权窗口)

   用户授权或是静默授权之后会跳转到: `redirect_uri/?code=CODE&state=STATE`, query上的CODE字段为我们所要得到的code

   以下为可获得的参数:

   | 参数       | 是否必须 | 说明                     |
   | ---------- | -------- | ------------------------ |
   | appid      | 是       | 公众号的唯一标识         |
   | secret     | 是       | 公众号的appsecret        |
   | code       | 是       | 填写第一步获取的code参数 |
   | grant_type | 是       | 填写为authorization_code |

2. 使用code换取access_token和openid

调起支付窗口的两种方法:

1. 调用wx的API
2. 使用微信内置对象: WeixinJSBridge

该demo使用第二种方法, 使用nodejs做一些签名(如paySign字段)的处理(由前端处理会过于沉重), 之后再返回给前端, 然后前端再调用WeixinJSBridge实现支付;