class Bar{

	constructor(){

		this.config = {
			HLFactor:3,
			HRFactor:1
		}

		this.options={
			perRectHeight: 30,
			perRectMargin: 10,

			fontSize: 12,
			// titleHeight:25,
			titleHeight:0,
			pagePadding: 16
		}

		this.ctxHeight = 0;
		this.screenCSSWidth = 0;
		this.touchHandler = [];
		this.bar = null;
	}

	draw( options ){
		this.options = Object.assign({}, this.options, options);
		this.touchHandler = [];

		this.setScreenCSSWidth( windowWidth=>{
			this.screenCSSWidth = windowWidth - this.options.pagePadding;
			this.setCtxHeight( this.options.setCanvasSize ); //canvas 高度

			this.drawBar()
		})
	}

	drawBar(){
		let options = this.options;
		let series = options.series;
		let ctx = wx.createCanvasContext(options.renderTo);
		this.ctx = ctx;

		let maxTag = series.reduce( (a,b)=>a.value>b.value?a:b )
		let maxTagValue = maxTag.value;

		let conf = this.config;
		this.pixelValRate = (this.screenCSSWidth - conf.HLFactor*options.fontSize - options.fontSize* conf.HRFactor )/maxTagValue;

		// this.drawTitle()
		this.drawVAxis(); //纵坐标轴
		series.forEach((t, index)=> this.drawTagRect(t, index) )

		ctx.draw()
	}

	drawTagRect( serie, index ){
		let options = this.options;
		let conf = this.config;
		let ctx = this.ctx;

		let series = options.series;

		var color = ['6699FF', '09BB07', 'e64340', '576b95', 'FF9933', '9966FF','353535'];
		// var color = ['6699FF', '09BB07', 'e64340', '576b95'];
		ctx.setFillStyle('#'+color[index%color.length])

		var x = options.fontSize*conf.HLFactor+1;
		var y = (options.perRectHeight+options.perRectMargin)*index + options.titleHeight;
		
		var w = Math.floor(serie.value * this.pixelValRate);

		ctx.fillRect(x, y, w, options.perRectHeight)

		ctx.setFontSize(options.fontSize)
		ctx.fillText(serie.tag, options.fontSize/2, y+ (options.perRectHeight*2)/3) //y坐标的2/3 perRectHeight的偏移量

		this.touchHandler.push({
			area: [x-options.fontSize*conf.HLFactor, y, x+w, y+options.perRectHeight],
			serie: serie
		})
	}

	drawVAxis(){
		let options = this.options;
		let conf = this.config;
		let ctx = this.ctx;

		let tags = options.series.map( t=>t.tag )

		var x = options.fontSize*conf.HLFactor;

		ctx.beginPath()
		ctx.setFillStyle('#eeeeee')
		ctx.setLineWidth(1)
		ctx.moveTo( x, options.titleHeight )
		ctx.lineTo(x, this.ctxHeight )
		ctx.stroke()
	}

	drawTitle(){
		let ctx = this.ctx;
		let title = this.options.title;

		var titleHeight = this.options.titleHeight
		var fontSize = this.options.fontSize
		ctx.setFontSize(titleHeight-4);
		ctx.fillText(title, (this.screenCSSWidth-fontSize*(title.length+1))/2, titleHeight-4)
	}

	onTouch(e){
		var touchX = e.touches[0].x,
			touchY = e.touches[0].y;

		this.touchHandler.forEach( h=>{
			
			let inArea = touchX > h.area[0] && touchX < h.area[2]
						&& touchY > h.area[1] && touchY < h.area[3]

			// 在此区域
			if( inArea ){
				e.serie = h.serie;
				this.options.onTouch(e);
			}
		})
	}

	onTouchEnd(e){}

	setCtxHeight( handler ){
		let options = this.options

		var ctxHeight = options.series.length* (options.perRectHeight+ options.perRectMargin) - options.perRectMargin
		this.ctxHeight = ctxHeight+options.titleHeight;

		handler && handler({
			height: this.ctxHeight
		})
	}

	setScreenCSSWidth( cb ){
		wx.getSystemInfo({
			success: res=>{
				cb && cb(res.windowWidth);
			}
		});
	}
}

module.exports = Bar;