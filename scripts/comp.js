function addListener(type, listener) {
  if(!window.addEventListener) {
    document.body.attachEvent("on" + type, listener);
  } else {
    window.addEventListener(type, listener, false);
  }
}

function remListener(type, listener) {
  if(!window.removeEventListener) {
    document.body.detachEvent("on" + type, listener);
  } else {
    window.removeEventListener(type, listener, false);
  }
}

if(!Array.indexOf) {
  Array.prototype.indexOf = function(o,i){
    for(var j=this.length,i=i<0?i+j<0?0:i+j:i||0;i<j&&this[i]!==o;i++);return j<=i?-1:i
  }
}

Number.prototype.group = function(fontSize, comma, decimals) {
	var delimit = (comma == undefined) ? "," : comma,
	    size = (decimals == undefined) ? 3 : decimals,
	    fontSize = (fontSize == undefined) ? ["",""] : ["<span style=\"font-size: " + fontSize + "px;\">","</span>"],
	    temp = "", prefix = "", decimal = "", that = this + "", j = 0;

	if ( this < 0 ) {
		prefix = "-";
		that = that.slice(1);
	}

	if (that.indexOf('.') >= 0) {
		decimal = that.slice(that.indexOf('.') + 1);
		that = that.slice(0, that.indexOf('.'));
	}

	for (var i = that.length - 1; i >= 0; i--) {
		temp = that.charAt(i) + temp;
		if (((++j % size) == 0) && (i != 0))
      temp = delimit + fontSize[0] + temp + fontSize[1];
	}

	return (prefix + temp);
}

Number.prototype.roundTo = function(num_1) {
	return (Math.round(this * Math.pow(10, num_1)) / Math.pow(10, num_1));
}
