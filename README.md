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

前两步官方讲得比较清晰, 所以这里只讨论第三步, 因此默认以获得以下参数:

```js
[openid, appid, mchid, key]
//注: 这里的key是商户的key
```

调起支付窗口的两种方法:

1. 调用wx的API
2. 使用微信内置对象: WeixinJSBridge

该demo使用第二种方法, 使用nodejs做一些签名(如paySign字段)的处理(由前端处理会过于沉重), 之后再返回给前端, 然后前端再调用WeixinJSBridge实现支付;