(function(){
	/*	图案解锁
		poorpenguin - v1.0.0
	*/
	window.lock = function(object){
		var obj = object || {};
		this.width = obj.width || 300;				//设置canvas的width
		this.height = obj.height || 300;			//设置canvas的height
		this.chooseType = obj.chooseType || 3;		//设置图案一排和一列的个数
	}

	//初始化
	lock.prototype.init = function(){
		this.createDom();
		this.createCanvas();
		this.createOffBg();	//绘制离屏
		this.createBg();	//生成主屏背景
		this.bindEvent();
	}

	//创建dom结构以及设置样式
	lock.prototype.createDom = function(){
		//标题
		var h4 = '<h4 id="title" style="color:#66ccff;">请解锁</h4>';
		//两个画布，canvas为主画布,offScreen为离屏
		var canvas = document.createElement('canvas');
		var offScreen = document.createElement('canvas');
		canvas.setAttribute('id','canvas');
		canvas.setAttribute('width',this.width);
		canvas.setAttribute('height',this.height);
		offScreen.setAttribute('id','offScreen');
		offScreen.setAttribute('width',this.width);
		offScreen.setAttribute('height',this.height);
		canvas.setAttribute('style','display:inline-block;');
		offScreen.setAttribute('style','display:none;');
		//div包裹canvas和title
		var wrap = document.createElement('div');
		wrap.setAttribute('style','text-align:center;');
		wrap.innerHTML = h4;
		wrap.appendChild(canvas);
		wrap.appendChild(offScreen);
		//设置body
		document.body.setAttribute('style','background-color:#305066;');
		document.body.appendChild(wrap);
	}

	//创建画布
	lock.prototype.createCanvas = function(){
		this.canvas = document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.offScreen = document.getElementById('offScreen');
		this.offSctx = this.offScreen.getContext('2d');
	}

/*绑定事件*/
	//canvas绑定触摸事件:touchstart、touchmove、touchend
	lock.prototype.bindEvent = function(){
		var self = this;	//在给canvas绑定触摸事件的回调函数中 this代表的是canvas这个元素，而不是lock这个类
		this.touchFlag = false;
		//设置dom2级事件
		this.canvas.addEventListener('touchstart',function(e){
			self.getMousePo(e);
			self.mouseInCricle(self.restPoint);
		},false);
		this.canvas.addEventListener('touchmove',function(e){
			if(self.touchFlag){
				self.getMousePo(e);
				self.mouseInCricle(self.restPoint);
				self.update(self.lastPoint,'#CFE6FF');
			}
		},false);
		this.canvas.addEventListener('touchend',function(e){
			if(self.touchFlag){
				if(self.checkPass()){
					document.getElementById('title').innerHTML = '解锁成功';
					self.drawArc(self.lastPoint,'#7CFC00');
				}else{
					document.getElementById('title').innerHTML = '解锁失败';
					self.drawArc(self.lastPoint,'red');
				}
			}
			setTimeout(function(){
				self.reset();
			},500);
		},false);
	}


/*获取定位*/
	//获取鼠标在画布上的定位
	lock.prototype.getMousePo = function(e){
		var canvasPo = this.canvas.getBoundingClientRect();	//获取画布的位置
		this.mouseInCanvas = {	//触摸点在画布上的定位
			x: e.touches[0].clientX - canvasPo.left,
			y: e.touches[0].clientY - canvasPo.top
		}
	}
	//判读鼠标点击是否在圆内
	lock.prototype.mouseInCricle = function(arr){
		
		for(var i=0; i<arr.length; i++){
			if(Math.abs(arr[i].x-this.mouseInCanvas.x) < this.r && Math.abs(arr[i].y-this.mouseInCanvas.y) < this.r ){
				this.lastPoint.push(arr[i]);
				this.restPoint.splice(i,1);
				this.touchFlag = true;
				break;
			}
		}
	}


/*绘制*/
	//绘制离屏背景
	lock.prototype.createOffBg = function(){
		var n = this.chooseType;
		this.r = this.canvas.width/(4*n+2);
		var r = this.r;
		var count = 0;
		this.arr = [];			//所有的圆
		this.lastPoint = [];	//已经经过的圆
		this.restPoint = [];	//未经过剩余的圆

		for(var i=0 ; i < n; i++){	//行
			for(var j=0; j < n; j++){	//列
				var obj = {
					x: j*4*r + 3*r,
					y: i*4*r + 3*r,
					index: ++count
				};
				this.arr.push(obj);
				this.restPoint.push(obj);
			}
		}

		//在离屏画出圆阵列
		this.offSctx.clearRect(0,0,this.offScreen.width,this.offScreen.height);
		this.offSctx.strokeStyle = '#CFE6FF';
		for(var i=0; i < this.arr.length; i++){
			this.offSctx.beginPath();
			this.offSctx.arc( this.arr[i].x, this.arr[i].y, this.r, 0, Math.PI*2);
			this.offSctx.stroke();
			//this.offSctx.fillText(this.arr[i].index, this.arr[i].x, this.arr[i].y);
		}
	}
	//生成主屏背景
	lock.prototype.createBg = function(){
		this.ctx.drawImage( this.offScreen, 0, 0, this.offScreen.width, this.offScreen.height, 0, 0, this.canvas.width, this.canvas.height);
	}
	//更新画布
	lock.prototype.update = function(arr,color){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	//清空整个画布保证不会出现多余的线条
		this.createBg();	//重绘制背景
		this.drawPoint(arr,color);
		this.drawLine(arr,color);
	}
	//画点
	lock.prototype.drawPoint = function(arr,color){
		this.ctx.fillStyle = color;
		for(var i=0; i<arr.length; i++){
			this.ctx.beginPath();
			this.ctx.arc( arr[i].x, arr[i].y, this.r/2, 0, Math.PI*2);
			this.ctx.fill();
		}

	}
	//画线
	lock.prototype.drawLine = function(arr,color){
		this.ctx.beginPath();
		this.ctx.strokeStyle = '#CFE6FF';
		this.ctx.lineWidth = 3;
		this.ctx.moveTo(arr[0].x, arr[0].y);
		for(var i=1; i<arr.length; i++){
			this.ctx.lineTo(arr[i].x, arr[i].y);
		}
		this.ctx.lineTo(this.mouseInCanvas.x, this.mouseInCanvas.y);
		this.ctx.stroke();
	}
	//画圆弧
	lock.prototype.drawArc = function(arr,color){
		this.ctx.strokeStyle = color;
		for(var i=0; i<arr.length; i++){
			this.ctx.beginPath();
			this.ctx.arc( arr[i].x, arr[i].y, this.r, 0, Math.PI*2);
			this.ctx.stroke();
		}

	}
	//重置
	lock.prototype.reset = function(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	//清空整个画布保证不会出现多余的线条
		this.createBg();	//重绘制背景
		document.getElementById('title').innerHTML = '请解锁';
		this.lastPoint = [];
		this.restPoint = this.arr.slice(0);
		this.touchFlag = false;
	}


/*判断密码*/
	lock.prototype.checkPass = function(){
		var password = '1234';
		var p2 = '';
		for(var i=0; i<this.lastPoint.length; i++){
			p2 += this.lastPoint[i].index;
		}
		return p2 === password;
	}

})();