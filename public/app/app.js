
var play = function(pjs) {

	//style
	var bkg = pjs.color(250);

	var quotes = [];
	var currQuote = null;

	var center;

	var K = .02;
	var G = 1000;
	var quoteG = 200;
	var maxAccel = 5;

	var quoteRad = 30;
	var quoteDist = 80;

	var numLevels = 18;
	var levelDiff;

	var humanCol = {
		r:59,g:134,b:134
	}

	var nonhumanCol = {
		r:207,g:240,b:158
	}
	
	pjs.setupScreen = function(){
		pjs.size(pjs.screenWidth, pjs.screenHeight);
		center = new pjs.PVector(pjs.width/2, pjs.height/2);
		levelDiff = pjs.width/numLevels;
	};

	pjs.setup = function(){
		
		pjs.setupScreen();

		pjs.noStroke();
		pjs.smooth();
		pjs.textAlign(pjs.CENTER);
		pjs.imageMode(pjs.CENTER);
		pjs.textSize(30);

		pjs.getAllQuotes();

	};

	pjs.getAllQuotes = function(){
		getQuotes(function(data){
			quotes = [];
			for(var i=0; i<data.quotes.length; i++){
				var curr = data.quotes[i];
				console.log(curr);
				quotes.push(new Quote(curr.quote, curr.human, pjs.width/2,-100));
			}
			console.log(quotes);
			layoutQuotes();
		});
	}

	pjs.draw = function(){
		pjs.background(bkg);

		drawLevels();

		for(var i=0; i<quotes.length; i++){
			quotes[i].render();
		}
	};

	pjs.mouseMoved = function(){
		var mouse = new pjs.PVector(pjs.mouseX, pjs.mouseY);

		var nearest = findNearestVec(quotes, mouse);

		if(nearest && nearest.el && nearest.dist <= nearest.el.rad){
			var pos = nearest.el.orig;
			var loc = new pjs.PVector(pos.x, pos.y);
			if(pos.x < pjs.width/3){
				loc.x = pjs.width*1/3;
			}else if(pos.x > pjs.width*2/3){
				loc.x = pjs.width*2/3;
			}

			if(pos.y < pjs.height/3){
				loc.y = pjs.height*2/3;
			}else if(pos.y > pjs.height*2/3){
				loc.y = pjs.height*1/2;
			}

			quoteEl.innerHTML = '<p>' + nearest.el.quote + '</p>';
			quoteEl.style.left = Math.floor(loc.x)-200 + 'px';
			quoteEl.style.top = Math.floor(loc.y)-175 + 'px';
		}else{
			quoteEl.innerHTML = ''
		}
	}


	pjs.mousePressed = function(){
		var mouse = new pjs.PVector(pjs.mouseX, pjs.mouseY);

		var nearest = findNearestVec(quotes, mouse);

		if(nearest.el && nearest.dist <= nearest.el.rad){
			currQuote = nearest.el;
			console.log(currQuote.human)
			quoteEl.innerHTML = ''
		}
	}

	pjs.mouseDragged = function(){
		var mouse = new pjs.PVector(pjs.mouseX, pjs.mouseY);
		if(currQuote){
			currQuote.pos.x = mouse.x;
			currQuote.pos.y = mouse.y;
		}
	}

	pjs.mouseReleased = function(){
		var mouse = new pjs.PVector(pjs.mouseX, pjs.mouseY);
		
		if(currQuote){
			var x = currQuote.pos.x;
			var human = Math.floor(x/levelDiff - numLevels/2);
			if(human < currQuote.human){
				currQuote.human--;
			}else if(human > currQuote.human){
				currQuote.human++;
			}
			layoutQuotes();
		}
	
		currQuote = null;
	}

	var layoutQuotes = function(){

		quotes.sort(function(a, b){
			return a.human - b.human;
		});

		//put into numLevels buckets
		var buckets = [];

		for(var i=0; i<=numLevels; i++){
			var x = i - numLevels/2;
			var currBucket = quotes.filter(function(el){
				return Math.floor(el.human) == x;
			});
			currBucket.sort(function(a, b){
			return a.quote.length - b.quote.length;
			});
			buckets.push(currBucket);
		}

		for(var i=0; i<buckets.length; i++){
			var currBucket = buckets[i];
			var y = currBucket.length*quoteDist;
			var startY = pjs.height/2 - y/2;
			for(var j=0; j<currBucket.length; j++){
				var curr = currBucket[j];
				curr.orig.x = pjs.width/numLevels*i + levelDiff/2;
				curr.orig.y = startY + j*quoteDist;
			}
		}


	};

	var drawLevels = function(){
		for(var i=0; i<numLevels; i++){
			var x = i*levelDiff;
			var col = {
				r: (nonhumanCol.r - humanCol.r)/numLevels*i + humanCol.r,
				g: (nonhumanCol.g - humanCol.g)/numLevels*i + humanCol.g,
				b: (nonhumanCol.b - humanCol.b)/numLevels*i + humanCol.b
			}
			pjs.fill(col.r, col.g, col.b);
			pjs.rect(x, 0, levelDiff, pjs.height);
		}
	};

	var findNearestVec = function(arr, vec){
		if(arr.length == 0){
			return null;
		}

		var minT = arr[0];
		var minDist = pjs.PVector.dist(vec, arr[0].pos);

		if(arr.length > 1){
			for(var i=1; i<arr.length; i++){		
				var currDist = pjs.PVector.dist(vec,arr[i].pos);
				if(currDist < minDist){
					minDist = currDist;
					minT = arr[i];
				}
			}
		}

		return {
			el: minT,
			dist: minDist
		};
	};

	var Quote = function(quote, human, x, y){
		this.quote = quote;
		this.human = human;
		this.rad = quoteRad;
		this.pos = new pjs.PVector(x, y);
		this.orig = new pjs.PVector(x, y);
		this.v = new pjs.PVector();
		this.a = new pjs.PVector();
		this.neighbors = [];

		this.color = pjs.color(100, 100);

		this.hooke = function(vec){
			var fromOrig = pjs.PVector.sub(this.pos,vec);
			fromOrig.mult(-1*K)
			this.a.x += fromOrig.x;
			this.a.y += fromOrig.y;
		};

		this.newton = function(vec){
			var dist = pjs.PVector.dist(vec, this.pos);
			var accel = new pjs.PVector(this.pos.x, this.pos.y);
			accel.sub(vec);
			accel.normalize();
			accel.mult(G/(dist*dist));
			this.a.sub(accel);
		};

		this.coloumb = function(vec){
			var dist = pjs.PVector.dist(vec, this.pos);
			var accel = new pjs.PVector(this.pos.x, this.pos.y);
			accel.sub(vec);
			accel.normalize();
			accel.mult(quoteG/(dist*dist));
			this.a.add(accel);
		};

		this.collides = function(vec){
			return pjs.PVector.dist(vec, this.pos) <= this.rad;
		};

		this.limitAccel = function(){
			var mag = this.a.mag();
			if(mag > maxAccel){
				this.a.div(mag / maxAccel);
			}
		};

		this.tick = function(){
			this.hooke(this.orig);

			this.v.mult(.9);

			this.limitAccel();
			this.v.add(this.a);
			this.pos.add(this.v);
			this.a.x = 0;
			this.a.y = 0;
		};

		this.render = function(){
			if(this == currQuote){
				pjs.fill(this.color,200);
			}else{
				this.tick();
				pjs.fill(this.color);
			}

			pjs.ellipse(this.pos.x, this.pos.y, this.rad*2, this.rad*2)
		};

	};
};

var canvas = document.getElementById("pcanvas");
var quoteEl = document.getElementById("quote");
var pjs = new Processing(canvas, play);

//set up resize event
window.onresize = function(event) {
   pjs.setupScreen();
}

var clearQuote = function(){
	quoteEl.innerHTML = '';
}

