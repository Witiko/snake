(function(undefined) {

  var funcPointer = {
        log: Math.log,
        pow: Math.pow
      },
      isNumber = Number.isNumber,
      isFloat = function(n) {
        return /\./.test(n);
      };

  // Number.prototype
  Number.prototype.toFract = function() {
    var num = this.toString();
    if(/e\+/.test(num)) return [this, 1];
    var precision = /\d*(\.\d*)?(e-\d*)?/.exec(num),
        divident, divisor, greatestDivisor;
    precision = (precision[1] || " ").length - 1 -
         Number((precision[2] || "" ).substr(1));
    greatestDivisor = Math.gCommDiv(
      (divisor  = precision.exp10()),
      (divident = this * divisor)
    );
    return [
      divident / greatestDivisor,
      divisor  / greatestDivisor
    ]
  };

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
  };

  Number.prototype.gradToDeg = function() {
    return this * 0.9;
  };

  Number.prototype.gradToRad = function() {
    return this * Math.PI / 200;
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

  // Math
  Math.rt = function() {
    switch(arguments.length) {
      case 0: return NaN;
      case 1:
        return isNumber(arguments[0])?arguments[0].sqrt():NaN;
      default:
        return isNumber(arguments[0]) &&
               isNumber(arguments[1])?arguments[0].pow(1 / arguments[1]):NaN;
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
        if(isNumber(arguments[0]))
          return funcPointer.pow(arguments[0], 2);
        else throw err.type;
      default:
        return isNumber(arguments[0]) &&
               isNumber(arguments[1])?funcPointer.pow(arguments[0], arguments[1]):NaN;
    }
  };

  Math.log = function() {
    switch(arguments.length) {
      case 0: return NaN;
      case 1:
        return isNumber(arguments[0])?arguments[0].ln():NaN;
      default:
        return isNumber(arguments[0]) &&
               isNumber(arguments[1])?arguments[1].ln() / arguments[0].ln():NaN;
    }
  };

  Math.log10 = function(x) {
    if(x === undefined ||
       !isNumber(x)) return NaN;
    return Math.log(10, x);
  };

  Math.exp10 = function(x) {
    if(x === undefined ||
       !isNumber(x)) return NaN;
    return (10).pow(x);
  };

  Math.fac = function(n) {
    if(n === undefined ||
       !isNumber(n) ||
       isFloat(n) ||
       n == Infinity ||
       n < 0) return NaN;
    var result = 1;
    while(n > 0) result *= n--;
    return result;
  };

  Math.med = function() {
    if(arguments.length < 2) return NaN;
    return arguments.length & 1?
      arguments[(arguments.length / 2).floor()]:
      (arguments[arguments.length / 2] +
       arguments[arguments.length / 2 - 1]) / 2;
  };


  Math.sum = function(sum, index) {
    if(arguments.length === 0 ||
       !Array.isArray(sum)) return NaN;
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

  Math.avgVar = function() {
    if(arguments.length < 2) return NaN;
    var sum = 0, count = 0, length = arguments.length;
    do {
      sum += arguments[count].pow();
    } while(++count < length)
    return sum / length - Math.avg.apply(Math, arguments).pow();
  };

  Math.avgOffset = function() {
    return (Math.avgVar.apply(Math, arguments)).sqrt() / Math.avg.apply(Math, arguments);
  };

  Math.gAvg = function() {
    if(arguments.length < 2) return NaN;
    var sum = 1, count = 1, length = arguments.length;
    do {
      sum *= arguments[count] / arguments[count - 1];
    } while(++count < length)
    return sum.rt(arguments.length);
  };

  Math.hAvg = function() {
    if(arguments.length < 2) return NaN;
    var sum = 0, count = 0, length = arguments.length;
    do {
      sum += 1 / arguments[count];
    } while(++count < length)
    return 1 / (1 / arguments.length * sum);
  };

  Math.lim = function(f, x, prec) {
    if(x === undefined ||
       f === undefined ||
      !isNumber(x) ||
      !(f instanceof Function) ||
       x === -Infinity ||
       x ===  Infinity ||
      (prec !== undefined &&
      (!isNumber(prec) ||
      (prec <= 0))))
         return NaN;
    if(prec === undefined)
         prec = 1;

    var dx = (2).pow(-prec + 1),
        tans = [
          f.tanLine(x + dx, prec + 1),
          f.tanLine(x - dx, prec + 1)
        ], points = [
          tans[0] instanceof Function?tans[0](x):NaN,
          tans[1] instanceof Function?tans[1](x):NaN
        ], results = [];

    if(!isNaN(points[0])) results.push(points[0]);
    if(!isNaN(points[1])) results.push(points[1]);

    return results.avg();
  };

  Math.diff = function(f, x, diffClass, prec) {
    if(x === undefined ||
       f === undefined ||
      !isNumber(x) ||
      !(f instanceof Function) ||
      (diffClass !== undefined &&
      (!isNumber(diffClass) ||
      (diffClass <= 0))) ||
      (prec !== undefined &&
      (!isNumber(prec) ||
      (prec <= 0)))) return NaN;
    if(diffClass === undefined)
      diffClass = 1;
    else if(diffClass > 1) {
      var diff = arguments.callee;
      return diff(function(x, prec) {
        return diff(f, x, 1, prec);
      }, x, diffClass - 1, prec);
    }
    if(prec === undefined)
      prec = 1;
    else prec = (2).pow(-prec + 1);
    return Math.avg(
        f(x, prec) - f(x - prec, prec),
      -(f(x, prec) - f(x + prec, prec))
    ) * 1 / prec;
  };

  Math.integrate = function(f, a, b, prec, scale) {
    if(a === undefined ||
       b === undefined ||
       f === undefined ||
      !isNumber(a) ||
      !isNumber(b) ||
      !(f instanceof Function) ||
       a > b ||
      (prec !== undefined &&
      (!isNumber(prec) ||
      (prec <= 0)))) return NaN;
    if(prec === undefined)
         prec = 1;
    if(scale === undefined)
      scale = true;
    var r = (scale?(b - a).pow():
                            (b - a)) * (2).pow(prec - 1),
        h = (b - a) / r,
        result = 0,
        x = a;
    do {
      result += h * (f(x) + f(x += h)) / 2;
    } while(x < b)
    return result.abs();
  };

  Math.integRot = function(f, a, b, prec, scale) {
    return f instanceof Function !== false?
      Math.PI * Math.integrate(function(x) {
        return f(x).pow();
      }, a, b, prec, scale):NaN;
  };

  Math.comb = function(n, k) {
    if(n === undefined ||
       k === undefined ||
       !isNumber(n) ||
       !isNumber(k) ||
       n < 0 || k < 0 || k > n)
         return NaN;
    if(n === k || k === 0)
      return 1;
    if(k === 1)
      return n;
    return n.fac() / (k.fac() * (n - k).fac());
  };

  Math.gCommDiv = function(a, b) {
    if(a === undefined ||
       b === undefined ||
       !isNumber(a) ||
       !isNumber(b))
         return NaN;
    var length;
    if((length = arguments.length - 1) > 1) {
      var results = [];
      for(var index = 0; index < length; index++) {
        results.push(
          Math.gCommDiv(
            arguments[index],
            arguments[index + 1]
          )
        );
      }
      return Math.gCommDiv.apply(Math, results);
    } else {
      a = a.abs(); b = b.abs();
      var divident = Math.max(a, b),
          divisor = Math.min(a, b),
          quotient = (divident / divisor).floor(),
          remainder = divident % divisor;
      while(remainder > 0) {
        divident = divisor;
        divisor = remainder;
        remainder = divident % divisor;
      }
      return divisor;
    }
  };

  Math.lCommMul = function(a, b) {
    if(a === undefined ||
       b === undefined ||
       !isNumber(a) ||
       !isNumber(b))
         return NaN;
    var length;
    if((length = arguments.length - 1) > 1) {
      var results = [];
      for(var index = 0; index < length; index++) {
        results.push(
          Math.lCommMul(
            arguments[index],
            arguments[index + 1]
          )
        );
      }
      return Math.lCommMul.apply(Math, results);
    } else return (a * b).abs() / Math.gCommDiv(a, b);
  };

  // Array.prototype
  Array.prototype.avg = function() {
    return Math.avg.apply(Math, this);
  };

  Array.prototype.avgVar = function() {
    return Math.avgVar.apply(Math, this);
  };

  Array.prototype.avgOffset = function() {
    return Math.avgOffset.apply(Math, this);
  };

  Array.prototype.gAvg = function() {
    return Math.gAvg.apply(Math, this);
  };

  Array.prototype.hAvg = function() {
    return Math.hAvg.apply(Math, this);
  };

  Array.prototype.med = function() {
    return Math.med.apply(Math, this);
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

  // Function prototype
  Function.prototype.d = function(diffClass) {
    if((diffClass !== undefined &&
      (!isNumber(diffClass) ||
      (diffClass <= 0)))) return NaN;
    if(diffClass === undefined)
      diffClass = 1;
    var f = this;
    return function(x, prec) {
      return Math.diff(f, x, diffClass, prec);
    };
  };

  Function.prototype.diff = function(x, diffClass, prec) {
    return Math.diff(this, x, diffClass, prec);
  };

  Function.prototype.lim = function(x, prec) {
    return Math.lim(this, x, prec);
  };

  Function.prototype.tanLine = function(x, prec) {
    if(x === undefined ||
       !isNumber(x) ||
       x ===  Infinity ||
       x === -Infinity ||
      (prec !== undefined &&
      (!isNumber(prec) ||
      (prec <= 0)))) return NaN;

    if(prec === undefined)
         prec = 1;

    var y = this(x),
        k = this.diff(x, 1, prec),
        q = y - k * x;

    return function(x) {
      return k * x + q;
    };
  };

  Function.prototype.integrate = function(a, b, prec, scale) {
    return Math.integrate(this, a, b, prec, scale);
  };

  Function.prototype.integRot = function(a, b, prec, scale) {
    return Math.integRot(this, a, b, prec, scale);
  };

})();