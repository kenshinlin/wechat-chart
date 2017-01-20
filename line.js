class Line{
	constructor(){
		this.config = {
			screenCSSWidth: null,
			mainCtxHeight: 220,
			legendWidth: 50,
			fontSize:12,

			VBFactor:1.5,
			// VTFactor:2,
			VTFactor:0,
			HFactor:2,

			pagePadding: 16
		} //无复杂运算，直接在这里设置初始值即可

		this.touchHandler=[];
		this.options = null
		this.ctx = null
		this.touchmoveTimer=null
	}

	setScreenCSSWidth( cb ){
		wx.getSystemInfo({
			success: res=>{
				this.config.screenCSSWidth = res.windowWidth - this.config.pagePadding
				cb && cb();
			}
		});
	}

	setCtxHeight( handler ){
		let conf = this.config
		let height = conf.mainCtxHeight + conf.VTFactor*conf.fontSize + conf.VBFactor*conf.fontSize

		this.config.ctxHeight = height;

		handler && handler({
			height: height
		})
	}

	draw( options ){

		this.options = options;
		this.touchHandler = [];

		this.setScreenCSSWidth( e=>{
			let series = options.series.map(d=>d.value);

			this.setCtxHeight( options.setCanvasSize);

			let conf = this.config;

			let maxValue = series.reduce((a,b)=>a>b?a:b);

			this.config.maxValue = maxValue;

			options.startValue = options.startValue||0;
			this.config.pixelsPerValue = conf.mainCtxHeight/(maxValue-options.startValue);

			let mainCtxWidth = conf.screenCSSWidth - conf.HFactor*conf.fontSize - 3;
			this.config.mainCtxWidth = mainCtxWidth;
			this.config.pixelsPerXCell = mainCtxWidth/(series.length-1);
		
			let ctx = this.ctx = wx.createCanvasContext( options.renderTo );

			this.drawAxis(options);
			this.drawLine(options);
			this.drawScaleMark( options ); //画刻度线
			// this.drawLegend(options);
			
			this.drawTouchLine();

			this.ctx.draw();
		})
	}

	drawAxis(){
		let ctx = this.ctx;

		let conf = this.config;

		ctx.beginPath()
		ctx.setLineWidth(1);

		let orgX = conf.fontSize*conf.HFactor;
		let orgY = conf.ctxHeight - conf.VBFactor*conf.fontSize;
		this.config.orgX = orgX;
		this.config.orgY = orgY;

		ctx.moveTo( orgX, orgY );
		ctx.lineTo( orgX, conf.VTFactor*conf.fontSize)
		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo( orgX, orgY);
		ctx.lineTo( orgX+conf.mainCtxWidth, orgY);
		ctx.stroke()
	}

	drawLine(options){
		let ctx = this.ctx;

		// let series = options.series.map(d=>d.value);

		ctx.setLineWidth(2);
		options.series.forEach((s, i)=>this.drawOneLine(s,i))
	}

	drawOneLine( serie, index ){
		let ctx = this.ctx;

		let conf = this.config;

		let x = conf.pixelsPerXCell*index + conf.orgX;
		let y = conf.orgY - conf.pixelsPerValue * serie.value;

		ctx.setStrokeStyle('#6699FF')
		ctx.setLineJoin('bevel')
		if( index == 0 ){
			ctx.beginPath();
			ctx.moveTo( x, y)
		}else{
			ctx.lineTo(x,y);
			ctx.stroke();
		}

		this.touchHandler.push({
			area:[x-conf.pixelsPerXCell/2, x+conf.pixelsPerXCell/2 ],
			serie: serie
		})
	}


	drawScaleMark( options ){
		let yCellCount = 10;
		let maxValue = this.config.maxValue; 
		maxValue = maxValue+( 10 - maxValue%10 );//整成10的倍数
		
		let startValue = options.startValue
		startValue = startValue*1===0?0:startValue+( 10 - startValue%10 );//整成10的倍数


		let valuePerYCell = (maxValue-startValue)/yCellCount;

		let pixelsPerYCell = valuePerYCell*this.config.pixelsPerValue

		this.ctx.setLineWidth(1);
		for(let i=0; i<10; i++ ){
			if( i%2 == 0){
				this.drawOneYMark( i==0, i*pixelsPerYCell, startValue+valuePerYCell*i )
			}
		}

		// 横坐标
		this.options.series.forEach( (s, i)=>{
			this.drawOneXMark( i, s.txt );
		})
		
	}

	drawOneXMark( index, txt){
		let ctx = this.ctx;

		let x = this.config.orgX + index*this.config.pixelsPerXCell;
		let y = this.config.orgY;

		if( index !== 0 ){
			ctx.beginPath()
			ctx.moveTo( x, y);
			ctx.lineTo( x,y+3);
			ctx.setStrokeStyle('black');
			ctx.stroke();
		}

		let gap = Math.ceil(this.options.series.length/8);

		if( index % gap == 0){
			ctx.setFontSize(this.config.fontSize);
			ctx.fillText( txt, x-this.config.fontSize/2, y+this.config.fontSize+5);
		}
	}

	onTouch(e){
		let touchX = e.touches[0].x,
			touchY = e.touches[0].y;

		this.touchHandler.forEach( h=>{
			
			var inArea = touchX > h.area[0] && touchX < h.area[1]

			// 在此区域
			if( inArea ){
				e.serie = h.serie;
				this.options.onTouch(e)

				this.options.touchingX = touchX;
				return this.draw( this.options )
			}
		})
	}

	onTouchMove(e) {
		if( this.touchmoveTimer )return;
		this.touchmoveTimer = setTimeout(s=>{
			this.onTouch(e);
			this.touchmoveTimer = null;
		}, 100);
	}

	onTouchEnd(e){
		// this.options.touchingX = false;
		// return this.draw( this.options );
	}

	drawOneYMark( isFirstMark, pixels, v ){
		let ctx = this.ctx;

		let x = this.config.orgX;
		let y = this.config.orgY - pixels;

		// 画刻度
		if( !isFirstMark ){
			ctx.beginPath();
			ctx.moveTo(x,y);
			ctx.lineTo(x-3, y);
			ctx.setStrokeStyle('black');
			ctx.stroke();
		}

		// 坐标
		ctx.setFontSize(this.config.fontSize)
		ctx.fillText(v, 0, y )
	}

	drawTouchLine(){
		let options = this.options;
		let ctx = this.ctx;

		if( options.touchingX ){
			ctx.beginPath();
			ctx.setStrokeStyle("#dddddd")
			ctx.moveTo( options.touchingX, this.config.orgY)
			ctx.lineTo( options.touchingX, this.config.VTFactor*this.config.fontSize)
			ctx.stroke()
		}
	}
}

module.exports = Line;