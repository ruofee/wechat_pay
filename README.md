# wechat_pay

> 微信公众号支付demo
>
> 微信官方的公众号支付: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_1
>
> 这几天在搞微信公众号支付, 因为微信支付的文档写得并不是很好, 所以也踩了很多坑, 所以在这里写个demo, 做一些简单的流程分析

所谓微信公众号支付, 就是使用微信自带的浏览器进行微信支付操作, 这有别于H5支付(使用移动端非微信的浏览器进行微信支付操作), 正常使用微信公众号支付大致为以下流程: 

1. 设置支付目录

2. 设置授权域名

3. 获取openid

4. 调出支付窗口

附上一张官方的流程图:

![](https://pay.weixin.qq.com/wiki/doc/api/img/chapter7_4_1.png)