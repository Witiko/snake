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

if(!("now" in Date))
  Date.now = function() {
    return new Date().getTime();
  };

Number.prototype.times = function(f) {
  var index = this;
  if(/\./.test(index) || index <= 0) return;
  while(index-- > 0) f();
};

// Non-standardized prototype.js inspired methods.
// They work akin to the bind function, but omit the context-rewriting part.

if(!("attach" in Function.prototype)) // The returned function ignores all passed arguments
  Function.prototype.attach = function() {
    var boundFunction = this,
        boundArguments = Array.prototype.slice.call(
          arguments, 0
        );
    return function() {
      return boundFunction.apply(
        this, boundArguments
      );
    };
  };

if(!("curry" in Function.prototype)) // The arguments passed to the returned function
  Function.prototype.curry = function() { // are concatenated with the bound arguments
    var boundFunction = this,
        boundArguments = Array.prototype.slice.call(
          arguments, 0
        );
    return function() {
      return boundFunction.apply(
        this, boundArguments.concat(
          Array.prototype.slice.call(
            arguments, 0
          )
        )
      );
    };
  };

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Array.prototype.removeByValue = function(value) {
  var index = this.indexOf(value);
  return index > -1?this.remove(index):this.length;
};

Array.prototype.removeByLastValue = function(value) {
  var index = this.lastIndexOf(value);
  return index > -1?this.remove(index):this.length;
};

Array.prototype.each = function(callback, from, to) {
  var length = this.length;
  if(callback instanceof Function === false ||
     length === 0) return this;

  if(from === undefined)
     from  = 0;
  if(to === undefined)
     to  = from < 0 && -from < length?0:length - 1;

  if(from < 0)
    from = -from >= length?0:length + from;
  else if(from > length - 1)
    from = length - 1;

  if(to < 0)
     to = -to >= length?(from > 0?0:length - 1):length + to;
  else if(to > length - 1)
    to = length - 1;

  if(from > to) do {
    if(callback.call(this, this[from], from) === false) return false;
  } while(from-- !== to) else if(from < to) do {
    if(callback.call(this, this[from], from) === false) return false;
  } while(from++ !== to) else if(callback.call(this, this[from], from) === false)
  return false; return this;
};

Array.prototype.equals = function(array, maxDepth) {
    if(maxDepth === 0) return true;
    var result = true;
    if ((array instanceof Array)
     && (array.length === this.length)
    ) {
        for (var i = 0, l = this.length; i < l; i++) {
            if ( (this[i] instanceof Array) && (array[i] instanceof Array) ) {
                result = Array.prototype.equal.call(this[i], array[i], maxDepth - 1);
            } else {
                if (array[i] !== this[i]) {
                    result = false;
                    break;
                }
            }
        }
    } else return false;
    return result;
};

if(!(Array.prototype.indexOf instanceof Function))
  Array.prototype.indexOf = function(needle, from) {
    if(this === undefined || this === null) throw new TypeError;
    for(var i = !from || from < 0?0:from,
            l = this.length; i < l; i++)
      if(this[i] === needle) return i; return -1;
  };

Array.prototype.random = function() {
  var l;
  return this[
    (l = this.length) <= 1?
      0:Math.ceil(
        Math.random() * l
      ) - 1
    ];
};

Array.prototype.pick = function() {
  var result, random, l;
  if((l = this.length) === 1) {
    result = this[0];
    this.length = 0;
  } else {
    random = Math.ceil(
      Math.random() * l
    ) - 1;
    result = this[random];
    this.remove(random);
  }
  return result;
};

Array.prototype.minArray = function() {
  var min = this.min(),
      array = [],
      index = 0;
  do {
    if((index = this.indexOf(min, index)) !== -1)
      array.push(index);
  } while(index++ > -1)
  return array;
};

Array.prototype.maxArray = function() {
  var max = this.max(),
      array = [],
      index = 0;
  do {
    if((index = this.indexOf(max, index)) !== -1)
      array.push(index);
  } while(index++ > -1)
  return array;
};

String.prototype.numberOf = function(needle) {
  var num = 0,
      lastIndex = 0;
  if(needle instanceof RegExp) {
    if(!needle.global) {
      var flags = "g";
      if(needle.ignoreCase) flags += "i";
      if(needle.multiline) flags += "m";
      needle = new RegExp(needle.source, flags);
    }
    return (num = this.match(needle)) !== null?num.length:0;
  } else {
    if(typeof needle !== "string" && !(needle instanceof String))
      needle = needle.toString();
    while((lastIndex = this.indexOf(needle, lastIndex) + 1) > 0)
      num++; return num;
  }
};

if(!("reverse" in String.prototype))
  String.prototype.reverse = function() {
    return this.split("").reverse().join("");
  };

Array.prototype.copy = function() {
  return this.slice(0);
};

Array.prototype.gather = String.prototype.gather = function(needle) {
  var indexes = [],
      lastIndex = 0,
      realIndex = 0,
      string = this,
      stringLength = string.length;
  if(needle instanceof RegExp) {
    while((realIndex = string.search(needle)) > -1 &&
          (lastIndex = realIndex + lastIndex) !== stringLength) {
      indexes.push(lastIndex++);
      string = string.slice(realIndex + 1);
    }
  } else {
    while((lastIndex = this.indexOf(needle, lastIndex)) > -1) {
      indexes.push(lastIndex++);
    }
  } return indexes;
};

Array.prototype.search = function(needle) {
  if(!(needle instanceof RegExp)) return this.indexOf(needle);
  var index = -1;
  this.each(function(content, i) {
    if(needle.test(content)) {
      index = i;
      return false;
    }
  });
  return index;
};

Object.each = function(object, callback) {
  if(!(object instanceof Object)) return object;
  for(var i in object) {
    if(callback.call(object, object[i], i) === false) return false;
  }
  return object;
};

Boolean.prototype.bitify = function() {
  return this.valueOf()?1:0;
};
