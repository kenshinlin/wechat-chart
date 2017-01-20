# wechat-chart
基于微信小程序 Canvas API 实现的柱状图和趋势图
# 用法

```
let Line = require('../../utils/line.js');
let line = new Line();
line.draw({
    renderTo: 'lineCanvas',
    series: data, //data 数据结构见下文
    pagePadding: 12, //页面左右padding的像素值
    setCanvasSize: o=>this.setData({lineCtxHeight:o.height}),  //设置 canvas 的高度，至于宽度，当前是限制宽度只能占满屏幕，暂时没有提供接口
    onTouch: e=>this.setData({ oneDayData: e.serie }) //点击事件，当点击趋势图时触发，e 是事件类（详见微信文档），e.serie 是当前点击处横坐标对应的对象，它是data的一个元素
})

// data的数据结构, data是一个数组，一个元素代表一个点，点击时这个点的数据会通过事件对象的 serie 属性传给回调函数。
// 所以调用者可以根据自己业务的需要添加信息，但有些字段是必须的：
[ 
  {
    value: 23,    //数字
    txt: '02-08'  //比如是日期
    ... // 调用者根据业务需要添加任意字段
  }
  ... 
]
```

```
let Bar = require('../../utils/bar.js');
let bar = new Bar();
bar.draw({
    renderTo:"tagRateCanvas",
    series:data,
    setCanvasSize: o=>this.setData({ctxHeight:o.height}),
    onTouch:(e)=>{
      let serie = e.serie
      this.renderRecords(serie.items)
    }
})


//data的数据结构
[
  {
    tag:"吃喝",
    value: 98
    ... // 调用者根据业务需要添加任意字段
  }
  ...
]

```

# DEMO & 示意图
- 体验DEMO
扫描进小程序 --> 天天随手记账 --> 记一笔账-->回到首页点左下角图标。进入统计页面即看到效果
![小程序二维码](https://github.com/kenshinlin/wechat-chart/blob/master/ssj_qr.png)

- 示意图

![小程序二维码](https://github.com/kenshinlin/wechat-chart/blob/master/linebar.png)
