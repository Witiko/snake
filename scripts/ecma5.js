(function(undefined) {
  if(!("now" in Date))
    Date.now = function() {
      return new Date().getTime();
    };

  Function.isFunction = function(f) {
    return typeof f    ===    "function" ||
                  f instanceof Function;
  };

  if(!(Array.isArray instanceof Function))
    Array.isArray = function(array) {
      return array instanceof Array;
    };

  if(!(Array.prototype.indexOf instanceof Function))
    Array.prototype.indexOf = function(needle, from) {
      if(this === undefined || this === null) throw new TypeError;
      for(var i = !from || from < 0?0:from,
              l = this.length; i < l; i++)
        if(this[i] === needle) return i; return -1;
    };

  if(!(Array.prototype.lastIndexOf instanceof Function))
    Array.prototype.lastIndexOf = function(needle, from) {
      if(this === undefined || this === null) throw new TypeError;
      for(var l = this.length,
              i = !from || from < 0?0:(from >= l?l - 1:from); i >= 0; i--)
        if(this[i] === needle) return i; return -1;
    };

  if(!(Array.prototype.every instanceof Function))
    Array.prototype.every = function(f, context) {
      if(this === undefined || this === null ||
       !(f instanceof Function)) throw new TypeError;
      for(var i = 0, l = this.length; i < l; i++)
        if(i in this && !f.call(context, this[i], i, this))
          return false; return true;
    };

  if(!(Array.prototype.map instanceof Function))
    Array.prototype.map = function(f, context) {
      if(this === undefined || this === null ||
       !(f instanceof Function)) throw new TypeError;
      for(var i = 0,
              l = this.length,
              res = new Array(l); i < l; i++)
        if(i in this) res[i] = f.call(context, this[i], i,this);
      return res;
    };

  if(!(Array.prototype.some instanceof Function))
    Array.prototype.some = function(f, context) {
      if(this === undefined || this === null ||
       !(f instanceof Function)) throw new TypeError;
      for(var i = 0, l = this.length; i < l; i++)
        if(i in this && f.call(context, this[i], i, this))
          return true; return false;
    };

  if(!(Array.prototype.filter instanceof Function))
    Array.prototype.filter = function(f, context) {
      if(this === undefined || this === null ||
       !(f instanceof Function)) throw new TypeError;
      for(var i = 0, value,
              l = this.length,
              res = []; i < l; i++)
        if(i in this && f.call(context, value = this[i], i, this))
          res.push(value); return res;
    };

  if(!(Array.prototype.forEach instanceof Function))
    Array.prototype.forEach = function(f, context) {
      if(this === undefined || this === null ||
       !(f instanceof Function)) throw new TypeError;
      for(var i = 0, l = this.length; i < l; i++)
        if(i in this) f.call(context, this[i], i, this);
    };

  if(!(Function.prototype.bind instanceof Function))
    Function.prototype.bind = function(context) {
      var boundArguments = Array.prototype.slice.call(
        arguments, 1
      ),  boundFunction = this;
      return function() {
        return boundFunction.apply(
          context, boundArguments.concat(
            Array.prototype.slice.call(
              arguments, 0
            )
          )
        );
      };
    };

  if(!(Object.create instanceof Function)) // Incomplete fallback, ignores the properties
    Object.create = function(object/*, descriptors*/) { // descriptors object part.
      var f = new Function;
      f.prototype = object;
      return new f;
    };

  if(!(String.prototype.trim instanceof Function))
    String.prototype.trim = function() {
      this.replace(/^\s+|\s+$/g, "");
    };

  if(!(String.prototype.trimLeft instanceof Function))
    String.prototype.trimLeft = function() {
      this.replace(/^\s+/g, "");
    };

  if(!(String.prototype.trimRight instanceof Function))
    String.prototype.trimLeft = function() {
      this.replace(/\s+$/g, "");
    };

  (function(shorthands, local) {
    for(var obj in shorthands) {
      (function(obj, arr) {
        arr.forEach(function(name) {
          if(!Function.isFunction(obj[name]))
            obj[name] = function(context) {
              return obj.prototype[name].call.apply(
                     obj.prototype[name], arguments);
            };
        });
      })(this[obj], shorthands[obj])
    }
  })({
    Array: ["concat", "join", "push", "pop", "shift", "unshift", "slice", "splice", "reverse", "sort", "indexOf", "lastIndexOf", "forEach",  "map", "filter", "every", "some", "reduce", "reduceRight"],
    String: ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "localeCompare", "match", "quote", "replace", "search", "slice", "split", "substr", "substring", "toLocaleLowerCase", "toLocaleUpperCase", "toLowerCase", "toUpperCase", "trim", "trimLeft", "trimRight"]
  }, {
    Array: Array,
    String: String
  });

})();