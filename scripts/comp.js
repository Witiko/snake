var addListener = !window.addEventListener?function(type, listener) {
  document.body.attachEvent("on" + type, listener);
}:function(type, listener) {
  window.addEventListener(type, listener, false);
};

var remListener = !window.removeEventListener?function(type, listener) {
  document.body.detachEvent("on" + type, listener);
}:function(type, listener) {
  window.removeEventListener(type, listener, false);
};

if(!Array.indexOf)
  Array.prototype.indexOf = function(o,i){
    for(var j=this.length,i=i<0?i+j<0?0:i+j:i||0;i<j&&this[i]!==o;i++);return j<=i?-1:i
  }

if(!Date.now)
  Date.now = function() {
    return new Date().getTime();
  }

if(window.NodeList)
  NodeList.prototype.toArray = function() {
  	for(var index = 0, length = this.length, array = []; index < length; index++) {
  		array.push(this[index]);
  	}
  	return array;
  }

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Array.prototype.each = function(callback) {
  if(typeof callback !== "function" || this.length === 0) return this;
  for(var index = 0; index < this.length; index++) {
    if(callback.call(this, this[index], index) == false) break;
  }
  return this;
}

/*

A lightweight version
  - "this" refference not passed
  - cannot be "break"-ed
  - array length changes during runtime not expected nor handled
  ---> Quicker

Array.prototype.each = function(callback) {
  var length = this.length, progress = 0;
  if(typeof callback !== "function" || length === 0) return;
  do{
    callback(this[progress]);
  } while(++progress < length)
}

*/

if(typeof Element == "object" && "\v" == "v") {
  (function() {
    var removeChild = Element.prototype.removeChild;
    Element.prototype.removeChild = function() {
      var d = arguments[0], a = d.attributes, i, l, n;
      if (a) {
          l = a.length;
          for (i = 0; i < l; i += 1) {
              n = a[i].name;
              if (typeof d[n] === 'function') {
                  d[n] = null;
              }
          }
      }
      a = d.childNodes;
      if (a) {
          l = a.length;
          for (i = 0; i < l; i += 1) {
              purge(d.childNodes[i]);
          }
    }
      removeChild.apply(this, arguments);
    }
  })();
}

Number.prototype.group = function(fontSize, comma, decimals) {
	var delimit = (comma == undefined) ? "," : comma,
	    size = (decimals == undefined) ? 3 : decimals,
	    temp = "", prefix = "", decimal = "", that = this + "", j = 0;
        fontSize = (fontSize == undefined) ? ["",""] : ["<span style=\"font-size: " + fontSize + "px;\">","</span>"];

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
