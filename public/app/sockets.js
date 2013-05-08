
var socket = io.connect(window.location.href);

var getQuotes = function(onComplete){
	socket.emit('getQuotes', 'all', onComplete);
}

var addQuote = function(quote, human){
	socket.emit('addQuote', {'quote': quote, 'human': human}, pjs.getAllQuotes);
}

$("#newquote").click(function(e){
	var rand = Math.random();
	var name, human;
	if(rand > .5){
		name = window.prompt("What does a human do?");
		human = 1;
	}else{
		name = window.prompt("What doesn't a human do?");
		human = -1;
	}

	if(name){
		addQuote(name, human);
	}

	
});