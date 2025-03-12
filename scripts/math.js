(function() {

  var funcPointer = {
        log: Math.log,
        pow: Math.pow
      }, isNumber = function(n) {
        return isNaN(n) === false &&
             (typeof n === "number" ||
                     n instanceof Number === true);
      }, isFloat = function(n) {
        return /\./.test(n);
      }, undefined;

  // Number.prototype
  Number.prototype.pow = function(pow) {
    return pow !== undefined?
      Math.pow(this, pow):
      Math.pow(this);
  };

  Number.prototype.log = function(base) {
    return base !== undefined?
      Math.log(base, this):
      Math.ln(this);
  };

  Number.prototype.log10 = function() {
    return Math.log10(this);
  };

  Number.prototype.exp10 = function(x) {
    return x !== undefined &&
           isNumber(x) !== true?
             NaN:(x === undefined?
               Math.exp10(this):
               this * Math.exp10(x)
           );
  };

  Number.prototype.ln = function() {
    return Math.ln(this);
  };

  Number.prototype.fac = function() {
    return Math.fac(this);
  };

  Number.prototype.comb = function(k) {
    return Math.comb(this, k);
  };

  Number.prototype.rt = function(index) {
    return index !== undefined?
      Math.rt(this, index):
      Math.sqrt(this);
  };

  Number.prototype.sqrt = function() {
    return Math.sqrt(this);
  };

  Number.prototype.abs = function() {
    return Math.abs(this);
  };

  Number.prototype.round = function() {
    return Math.round(this);
  };

  Number.prototype.floor = function() {
    return Math.floor(this);
  };

  Number.prototype.ceil = function() {
    return Math.ceil(this);
  };

  Number.prototype.sin = function() {
    return Math.sin(this);
  };

  Number.prototype.asin = function() {
    return Math.asin(this);
  };

  Number.prototype.cos = function() {
    return Math.cos(this);
  };

  Number.prototype.acos = function() {
    return Math.acos(this);
  };

  Number.prototype.tan = function() {
    return Math.tan(this);
  };

  Number.prototype.atan = function() {
    return Math.atan(this);
  };

  Number.prototype.cotg = function() {
    return Math.cotg(this);
  };

  Number.prototype.acotg = function() {
    return Math.acotg(this);
  };

  Number.prototype.sec = function() {
    return Math.sec(this);
  };

  Number.prototype.asec = function() {
    return Math.asec(this);
  };

  Number.prototype.csc = function() {
    return Math.csc(this);
  };

  Number.prototype.acsc = function() {
    return Math.acsc(this);
  };

  Number.prototype.sinh = function() {
    return Math.sinh(this);
  };

  Number.prototype.asinh = function() {
    return Math.asinh(this);
  };

  Number.prototype.cosh = function() {
    return Math.cosh(this);
  };

  Number.prototype.acosh = function() {
    return Math.acosh(this);
  };

  Number.prototype.tanh = function() {
    return Math.tanh(this);
  };

  Number.prototype.atanh = function() {
    return Math.atanh(this);
  };

  Number.prototype.coth = function() {
    return Math.coth(this);
  };

  Number.prototype.acoth = function() {
    return Math.acoth(this);
  };

  Number.prototype.sech = function() {
    return Math.sech(this);
  };

  Number.prototype.asech = function() {
    return Math.asech(this);
  };

  Number.prototype.csch = function() {
    return Math.csch(this);
  };

  Number.prototype.acsch = function() {
    return Math.acsch(this);
  };

  Number.prototype.degAdjust = function() {
    var angle = this;
    if(angle <    0) angle = angle % 360 + 360;
    if(angle >= 360) angle %= 360;
    return angle;
  };

  Number.prototype.radAdjust = function() {
    var angle = this;
    if(angle <  0)           angle = angle % (2 * Math.PI) + 2 * Math.PI;
    if(angle >= 2 * Math.PI) angle %= 2 * Math.PI;
    return angle;
  };

  Number.prototype.gradAdjust = function() {
    var angle = this;
    if(angle <    0) angle = angle % 400 + 400;
    if(angle >= 400) angle %= 400;
    return angle;
  };

  Number.prototype.degToRad = function() {
    return this / 180 * Math.PI;
  };

  Number.prototype.degToGrad = function () {
    return this / 0.9;
  };

  Number.prototype.radToDeg = function() {
    return this * 180 / Math.PI;
  };

  Number.prototype.radToGrad = function() {
    return this / Math.PI * 200;
  }

  Number.prototype.gradToDeg = function() {
    return this * 0.9;
  }

  Number.prototype.gradToRad = function() {
    return this * Math.PI / 200;
  }

  // Math
  Math.rt = function() {
    switch(arguments.length) {
      case 0: return NaN;
      case 1:
        return isNumber(arguments[0]) === true?arguments[0].sqrt():NaN;
      default:
        return isNumber(arguments[0]) === true &&
               isNumber(arguments[1]) === true?arguments[0].pow(1 / arguments[1]):NaN;
    }
  };

  Math.fib = function(n) {
    var g = (1 + Math.sqrt(5)) / 2;
    return Math.round((Math.pow(g,n) - Math.pow(-g,-n)) / Math.sqrt(5));
  };

  Math.ln = funcPointer.log;

  Math.cotg = function(x) {
    return x !== undefined?x.cos() / x.sin():NaN;
  };

  Math.acotg = function(x) {
    return x !== undefined?Math.PI / 2 - x.atan():NaN;
  };

  Math.sec = function(x) {
    return x !== undefined?1 / x.cos():NaN;
  };

  Math.asec = function(x) {
    return x !== undefined?x.acos(1 / x):NaN;
  };

  Math.csc = function(x) {
    return x !== undefined?1 / x.sin():NaN;
  };

  Math.acsc = function(x) {
    return x !== undefined?x.asin(1 / x):NaN;
  };

  Math.sinh = function(x) {
    return x !== undefined?(Math.E.pow(x) - Math.E.pow(-x)) / 2:NaN;
  };

  Math.asinh = function(x) {
    return x !== undefined?(x + (x.pow(2) + 1).sqrt()).ln():NaN;
  };

  Math.cosh = function(x) {
    return x !== undefined?(Math.E.pow(x) + Math.E.pow(-x)) / 2:NaN;
  };

  Math.acosh = function(x) {
    return x !== undefined?(x + (x.pow() - 1).sqrt()).ln():NaN;
  };

  Math.tanh = function(x) {
    return x !== undefined?x.sinh() / x.cosh():NaN;
  };

  Math.atanh = function(x) {
    return x !== undefined?0.5 * ((1 + x) / (1 - x)).ln():NaN;
  };

  Math.coth = function(x) {
    return x !== undefined?x.cosh() / x.sinh():NaN;
  };

  Math.acoth = function(x) {
    return x !== undefined?0.5 * ((x + 1) / (x - 1)).ln():NaN;
  };

  Math.sech = function(x) {
    return x !== undefined?1 / x.cosh():NaN;
  };

  Math.asech = function(x) {
    return x !== undefined?((1 + (1 - x.pow()).sqrt()) / x).ln():NaN;
  };

  Math.csch = function(x) {
    return x !== undefined?1 / x.sinh():NaN;
  };

  Math.acsch = function(x) {
    return x !== undefined?(1 / x + (1 + x.pow()).sqrt() / x.abs()).ln():NaN;
  };

  Math.pow = function() {
    switch(arguments.length) {
      case 0: return NaN;
      case 1:
        if(isNumber(arguments[0]) === true)
          return funcPointer.pow(arguments[0], 2);
        else throw err.type;
      default:
        return isNumber(arguments[0]) === true &&
               isNumber(arguments[1]) === true?funcPointer.pow(arguments[0], arguments[1]):NaN;
    }
  };

  Math.log = function() {
    switch(arguments.length) {
      case 0: return NaN;
      case 1:
        return isNumber(arguments[0]) === true?arguments[0].ln():NaN;
      default:
        return isNumber(arguments[0]) === true &&
               isNumber(arguments[1]) === true?arguments[1].ln() / arguments[0].ln():NaN;
    }
  };

  Math.log10 = function(x) {
    if(x === undefined ||
       isNumber(x) === false) return NaN;
    return Math.log(10, x);
  };

  Math.exp10 = function(x) {
    if(x === undefined ||
       isNumber(x) === false) return NaN;
    return (10).pow(x);
  };

  Math.fac = function(n) {
    if(n === undefined ||
       isNumber(n) === false ||
       isFloat(n) === true ||
       n == Infinity ||
       n < 0) return NaN;
    var result = 1;
    while(n > 0) result *= n--;
    return result;
  };

  Math.sum = function(sum, index) {
    if(arguments.length === 0 ||
       sum instanceof Array === false) return NaN;
    var result = 0, length = sum.length;
    index = isNumber(index)?index:0;
    if(index >= length) return 0;
    do {
      result += sum[index];
    } while(++index < length)
    return result;
  };

  Math.avg = function() {
    if(arguments.length < 1) return NaN;
    var sum = 0, count = 0, length = arguments.length;
    do {
      sum += arguments[count];
    } while(++count < length)
    return sum / count;
  };
  // Array.prototype
  Array.prototype.avg = function() {
    return Math.avg.apply(Math, this);
  };

  Array.prototype.min = function() {
    return Math.min.apply(Math, this);
  };

  Array.prototype.max = function() {
    return Math.max.apply(Math, this);
  };

  Array.prototype.sum = function(index) {
    return Math.sum(this, index);
  };
})();