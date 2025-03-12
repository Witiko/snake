Date.timezone = -new Date().getTimezoneOffset() / 60;

Boolean.isBoolean = function(b) {
  return b instanceof Boolean ||
         typeof b === "boolean";
};

Number.isNumber = function(n) {
  return isNaN(n) === false &&
       (typeof n === "number" ||
               n instanceof Number === true);
};

String.isString = function(s) {
  return s instanceof String ||
         typeof s === "string";
};

Number.prototype.times = function(f) {
  var index = this;
  if(/\./.test(index) || index <= 0) return;
  while(index-- > 0) f();
};

Boolean.prototype.xor = function(boolean) {
  var that = this.valueOf(),
      bool = boolean.valueOf();
  return (that && !bool) || (!that && bool);
};


Boolean.prototype.bitify = function() {
  return this.valueOf()?1:0;
};

Boolean.random = function() {
  return !Math.round(Math.random())
};

// Non-standardized prototype.js inspired methods.
// They work akin to the bind function, but omit the context-rewriting part.

Function.prototype.attach = function() {// The returned function ignores all passed arguments
  var boundFunction = this,
      boundArguments = Array.from(arguments);
  return function() {
    return boundFunction.apply(
      this, boundArguments
    );
  };
};

Function.prototype.partial = function() { // The arguments passed to the returned function
  var boundFunction = this, // are concatenated with the bound arguments
      boundArguments = Array.from(arguments);
  return function() {
    return boundFunction.apply(
      this, boundArguments.concat(Array.from(arguments))
    );
  };
};

if(!("reverse" in String.prototype))
  String.prototype.reverse = function() {
    return this.split("").reverse().join("");
  };

Array.prototype.remove = function(key) {
  this.splice(key, 1);
  return this.length;
};

Array.prototype.erase = function(value) {
  var index = this.indexOf(value);
  return index !== -1?this.remove(index):this.length;
};

Array.prototype.equals = function(array, maxDepth) {
    if(maxDepth === 0) return true;
    var result = true;
    if ((array instanceof Array)
     && (array.length === this.length)
    ) {
        for (var i = 0, l = this.length; i < l; i++) {
            if ( (this[i] instanceof Array) && (array[i] instanceof Array) ) {
                result = arguments.callee.call(this[i], array[i], maxDepth?maxDepth - 1:maxDepth);
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
    if(!String.isString(needle))
      needle = needle.toString();
    while((lastIndex = this.indexOf(needle, lastIndex) + 1) > 0)
      num++; return num;
  }
};

Array.prototype.last = function() {
  return this[this.length - 1];
};

Array.prototype.empty = function() {
  this.length = 0;
};

Array.prototype.include = function(item) {
  return !this.contains(item)?this.push(item):this.length;
};

Array.prototype.combine = function(array) {
  var thisGreater = this.length > array.length,
      base = (thisGreater?this:array).copy(),
      added = thisGreater?array:this;
  added.forEach(function(item) {
    if(!(base.contains(item))) base.push(item);
  }); return base;
};

Array.prototype.associate = function(values) {
  if(!Array.isArray(values)) throw new TypeError;
  var obj = {}; this.forEach(function(name, index) {
    obj[name] = values[index];
  }); return obj;
};

Array.prototype.numberOf = function(needle) {
  var num = 0,
      index = 0,
      string = this,
      stringLength = string.length;
  if(needle instanceof RegExp) {
    while(index = string.search(needle) + 1) {
      string = string.slice(index); num++;
    }
  } else {
    while(index = this.indexOf(needle, index) + 1) num++;
  } return num;
};

Array.prototype.copy = function() {
  return this.slice(0);
};

Array.prototype.clean = function() {
  var i = 0, l = this.length;
  while(i < l) {
    if(this[i] === undefined) {
      this.remove
    }
  }
};

Array.from = function(enumerable) {
  return Array.isArray(enumerable)?enumerable:
         Array.prototype.slice.call(enumerable);
};

String.prototype.contains = function(needle) {
  return needle instanceof RegExp?
         needle.test(this):this.indexOf(needle) !== -1;
};

Array.prototype.contains = function(needle) {
  return this[needle instanceof RegExp?"search":"indexOf"](needle) !== -1;
};

Array.prototype.gather = String.prototype.gather = function(needle) {
  var indexes = [],
      lastIndex = 0,
      realIndex = 0,
      string = this,
      stringLength = string.length;
  if(needle instanceof RegExp) {
    while((realIndex = string.search(needle)) !== -1 &&
          (lastIndex = realIndex + lastIndex) !== stringLength) {
      indexes.push(lastIndex++);
      string = string.slice(realIndex + 1);
    }
  } else {
    while((lastIndex = this.indexOf(needle, lastIndex)) !== -1) {
      indexes.push(lastIndex++);
    }
  } return indexes;
};

Array.prototype.search = function(needle) {
  if(!(needle instanceof RegExp)) return this.indexOf(needle);
  var index = -1;
  this.every(function(content, i) {
    if(needle.test(content)) {
      index = i;
      return false;
    } return true;
  });
  return index;
};

Object.forEach = function(object, callback) {
  if(!(object instanceof Object)) return object;
  for(var i in object) {
    if(callback.call(object, object[i], i) === false) return false;
  }
  return object;
};
