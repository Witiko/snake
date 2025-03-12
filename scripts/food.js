function Food(settings) {
  if(!(settings instanceof Object) ||
     !("css" in settings) ||
     !(settings.color instanceof Array))
    throw new Error("Provide the constructor with relevant data!");
  this._private = {
    css: settings.css,
    colorObj: settings.color[0],
    colorAttr: settings.color[1],
    anim: {
      callbacks: [],
      clearCallbacks: [],
      stoppers: []
    }
  };
  this.constructor.instances.push(this);
};

Food.instances = [];
Food.animListener = function(callback) {
  var length = this.instances.length,
      counter = 0,
      listen = function() {
        if(++counter === length)
          callback();
      };
  this.instances.each(function(instance) {
    instance.animListener(listen);
  });
};
Food.clear = function() {
  this.instances.each(function(instance) {
    instance.clear();
  });
};
Food.objClear = function(object) {
  if(object.animStopper instanceof Function) {
     object.animStopper();
     object.animCallback();
     delete object.animStopper;
     delete object.animCallback;
  }
};

Food.prototype.show = function(position, delay, callback) {
  var object = field.getObject.apply(field, position), formerObject,
      pointer = field.getElement.apply(field, position),
      $ = this._private,
      $$ = this.constructor, index, animInterrupt, animFinish, timeout;

  if(!delay) { // Žádný delay, jednoduše přepatláme novou css třídou
    field.spawn(position[0], position[1], $.css);
    $$.objClear(object);
  } else {  // Je delay, definujeme Stopper a Callback a zkopírujeme případné původní Stoppery a Callbacky

    if(Graphics.ChangingColor) $$.objClear(formerObject);
    else {
      formerObject = {};
      if(formerObject.animStopper instanceof Function)
        Object.each(object, function(value, key) {
          formerObject[key] = value;
        });
    }
    index = $.anim.stoppers.push(function() {
      animInterrupt();
      animFinish();
    }) - 1;
    $.anim.callbacks.push(function() {
      if($.anim.stoppers.length === 0 &&
         $.anim.clearCallbacks.length !== 0) {
         $.anim.clearCallbacks.each(function(callback) {
           callback();
         });
         $.anim.clearCallbacks.length = 0;
      }
    })
    object.animStopper = $.anim.stoppers[index];
    object.animCallback = $.anim.callbacks[index];

    if(Graphics.ChangingColor) { // Měníme barvy, definujeme vlastní animFinish a animInterrupt

      pointer.style.backgroundColor = originalCellColor;
      field.spawn(position[0], position[1], $.css);
      animFinish = function() {
        field.clearObject.apply(position);
        $.anim.stoppers.remove(index);
        $.anim.callbacks.remove(index);
        pointer.style.backgroundColor = "";
        if(callback instanceof Function)
           callback();
      };
      animInterrupt = recolor(delay, originalCellColor, $.colorObj[$.colorAttr],
        function(color) {
          pointer.style.backgroundColor = color;
        }, function() {
          animFinish();
          $.anim.callbacks[index]();
        }
      );

    } else { // Neměníme barvy, definujeme vlastní animFinish a animInterrupt

      animFinish = function() {
        field.spawn(position[0], position[1], $.css);
        $$.objClear(formerObject);
        if(callback instanceof Function)
           callback();
      };
      timeout = setTimeout(function() {
        animFinish();
        $.anim.callbacks[index]();
      }, delay / 2);
      animInterrupt = function() {
        clearTimeout(timeout);
      };

    }
  }
};
Food.prototype.hide = function(position, delay, callback) {
  var object = field.getObject.apply(field, position), formerObject,
      pointer = field.getElement.apply(field, position),
      $ = this._private,
      $$ = this.constructor, index, animInterrupt, animFinish, timeout;

  if(!delay) { // Žádný delay, jednoduše přepatláme novou css třídou
    $$.objClear(object);
    field.remove.apply(field, position);
  } else {  // Je delay, definujeme Stopper a Callback a zkopírujeme případné původní Stoppery a Callbacky

    if(Graphics.ChangingColor) $$.objClear(formerObject);
    else {
      formerObject = {};
      if(formerObject.animStopper instanceof Function)
        Object.each(object, function(value, key) {
          formerObject[key] = value;
        });
    }
    index = $.anim.stoppers.push(function() {
      animInterrupt();
      animFinish();
    }) - 1;
    $.anim.callbacks.push(function() {
      if($.anim.stoppers.length === 0 &&
         $.anim.clearCallbacks.length !== 0) {
         $.anim.clearCallbacks.each(function(callback) {
           callback();
         });
         $.anim.clearCallbacks.length = 0;
      }
    })
    object.animStopper = $.anim.stoppers[index];
    object.animCallback = $.anim.callbacks[index];

    if(Graphics.ChangingColor) { // Měníme barvy, definujeme vlastní animFinish a animInterrupt

      pointer.style.backgroundColor = $.colorObj[$.colorAttr];
      animFinish = function() {
        field.clearObject.apply(position);
        $.anim.stoppers.remove(index);
        $.anim.callbacks.remove(index);
        field.remove.apply(field, position);
        pointer.style.backgroundColor = "";
        if(callback instanceof Function)
           callback();
      };
      animInterrupt = recolor(delay, $.colorObj[$.colorAttr], originalCellColor,
        function(color) {
          pointer.style.backgroundColor = color;
        }, function() {
          animFinish();
          $.anim.callbacks[index]();
        }
      );

    } else { // Neměníme barvy, definujeme vlastní animFinish a animInterrupt

      animFinish = function() {
        $$.objClear(formerObject);
        field.remove.apply(field, position);
        if(callback instanceof Function)
           callback();
      };
      timeout = setTimeout(function() {
        animFinish();
        $.anim.callbacks[index]();
      }, delay / 2);
      animInterrupt = function() {
        clearTimeout(timeout);
      };

    }
  }
};
Food.prototype.transition = function(otherInstance, position, delay, callback) {
  var object = field.getObject.apply(field, position), formerObject,
      pointer = field.getElement.apply(field, position),
      $ = this._private,
      $$ = this.constructor,
      $$$ = otherInstance._private, index, animInterrupt, animFinish, timeout;

  if(!delay) { // Žádný delay, jednoduše přepatláme novou css třídou
    field.spawn(position[0], position[1], $$$.css);
    $$.objClear(object);
  } else {  // Je delay, definujeme Stopper a Callback a zkopírujeme případné původní Stoppery a Callbacky

    if(Graphics.ChangingColor) $$.objClear(formerObject);
    else {
      formerObject = {};
      if(formerObject.animStopper instanceof Function)
        Object.each(object, function(value, key) {
          formerObject[key] = value;
        });
    }
    index = $$$.anim.stoppers.push(function() {
      animInterrupt();
      animFinish();
    }) - 1;
    $$$.anim.callbacks.push(function() {
      if($$$.anim.stoppers.length === 0 &&
         $$$.anim.clearCallbacks.length !== 0) {
         $$$.anim.clearCallbacks.each(function(callback) {
           callback();
         });
         $$$.anim.clearCallbacks.length = 0;
      }
    })
    object.animStopper = $$$.anim.stoppers[index];
    object.animCallback = $$$.anim.callbacks[index];

    if(Graphics.ChangingColor) { // Měníme barvy, definujeme vlastní animFinish a animInterrupt

      pointer.style.backgroundColor = $.colorObj[$.colorAttr];
      animFinish = function() {
        field.clearObject.apply(position);
        $$$.anim.stoppers.remove(index);
        $$$.anim.callbacks.remove(index);
        field.spawn(position[0], position[1], $$$.css);
        pointer.style.backgroundColor = "";
        if(callback instanceof Function)
           callback();
      };
      animInterrupt = recolor(delay, $.colorObj[$.colorAttr], $$$.colorObj[$$$.colorAttr],
        function(color) {
          pointer.style.backgroundColor = color;
        }, function() {
          animFinish();
          $$$.anim.callbacks[index]();
        }
      );

    } else { // Neměníme barvy, definujeme vlastní animFinish a animInterrupt

      animFinish = function() {
        field.spawn(position[0], position[1], $$$.css);
        $$.objClear(formerObject);
        if(callback instanceof Function)
           callback();
      };
      timeout = setTimeout(function() {
        animFinish();
        $$$.anim.callbacks[index]();
      }, delay / 2);
      animInterrupt = function() {
        clearTimeout(timeout);
      };

    }
  }
};
Food.prototype.animListener = function(callback) {
  if(!(callback instanceof Function))
    throw new Error("Provide the method with relevant arguments!");
  var $ = this._private.anim;
  if($.callbacks.length !== 0)
     $.clearCallbacks.push(callback);
  else callback();
};
Food.prototype.clear = function() {
  var $ = this._private.anim;
  $.stoppers.each(function(callback, index) {
    callback();
    $.callbacks[index]();
  });
};

/*
Definované funkce a atributy:
  css - CSS class
  color - [objekt, vlastnost]

Přístupné funkce a atributy prototypu:
  show(position, delay,  callback) - 0 / undefined delay = okamžitě
  hide(position, delay, callback) - 0 / undefined delay = okamžitě
  transition(newFood, position, delay, callback) - 0 / undefined delay = okamžitě
  animListener(callback) - zavolá callback po dokončení veškerých animací
  clear() - zastaví a vymaže veškeré probíhající animace


Přístupné funkce a atributy konstruktoru:
  animListener(callback) - zavolá funkci animListener() u všech potomků
  find(maxDistance) - nalezne a navrátí pole všech dostupných polí
  clear() - zavolá funkci clear() u všech potomků
  objClear(objekt) - privátní metoda, zastaví a vymaže veškeré probíhající animace na daném poli
  instances - pole veškerých potomků
*/

var RegularFood = new Food({
  css: food,
  color: [foodColors, foodColorIndexes[food]]
}), BonusFood = new Food({
  css: bonusFood,
  color: [foodColors, foodColorIndexes[bonusFood]]
}), SuperFood = new Food({
  css: superFood,
  color: [foodColors, foodColorIndexes[superFood]]
}), LegendFood = new Food({
  css: legendFood,
  color: [foodColors, foodColorIndexes[legendFood]]
});
/*
var Spawn = {
  _private: {
    bonusTimer: new Array(3),
    legendFood: function() {
      var $ = this,
          position = Ego.find().random(),
          lifetime, index = 0;
      if(!position) return;
      lifetime = position[2] * bonusFoodTolerance[3]() + $.fadeInterval / currInterval;
      AchievementLegendFoodFading = false;
      LegendFood.spawn(position, $.fadeInterval);
      Snake.cleanCache(); // Provedeme výmaz pathFinding cache, jelikož ve stejném kole pozměňujeme obsah herního pole
      $.timeouts[legendFood] = setTimeout(function() { // Reakční timeout, tahy se spočítají a začnou odpočítávat až po daném počtu milisekund
        $.timeouts[legendFood] = -1;
        lifetime = Ego.find(position).length * bonusFoodTolerance[3]() + $.fadeInterval / currInterval || lifetime;
        $.callbacks[legendFood] = warpTimer;
        field.movement.addCallback(warpTimer);
      }, reactionTime), warpTimer = function() { // Odpočítávání do transformace jídla
        if(++index >= lifetime) {
          field.movement.removeCallback(warpTimer);
          $.callbacks[legendFood] = null;
          warp();
      }, warp = function() { // Samotná transformace jídla
        AchievementLegendFoodFading = true;
        LegendFood.transition(RegularFood, position, $.fadeInterval);
      };
    },
    superFood: function() {

    }
  },
  food: function() {
    if(field.isFull) return;
    var position = field.getFree().random(),
        $ = this._private;
    if(toss(legendFoodChance[2]())) // Naspawnujeme legendární pokrm
      $.legendFood(); else // Naspawnujeme standardní krmnou směs
      $.regularFood();
  },
  init: function() {
    var $ = this._.private, $$ = this;
    $.fadeInterval = 5 * currInterval;
    if($.intervals instanceof Object) {
      Object.each($.timeouts, function(value, key) {
        $$.clearTimeout(key);
      });
    } else $.timeouts = {};
    $.timeouts[legendFood] = -1;
    $.timeouts[superFood] = -1;
    $.timeouts[bonusFood] = -1;
    if($.callbacks instanceof Object) {
      Object.each($.callbacks, function(callback) {
        callback();
      });
    } else $.callbacks = {};
    $.callbacks[legendFood] = null;
    $.callbacks[superFood] = null;
    $.callbacks[bonusFood] = null;
  },
  set: function() {
    var $ = this._.private;
    $.bonusTimer[0] = 0; // Current progress
    $.bonusTimer[1] = calcBonusFoodSpawn(snake.length); // Number of steps
    $.bonusTimer[2] = true; // Counting enabled
  },
  clearTimeout: function(what) {
    var $ = this._.private;
    if($.timeouts[what] !== -1) {
      clearTimeout($.timeouts[what]);
      $.timeouts[what] = -1;
    }
  },
  clearCallback: function(what) {
    var $ = this._.private;
    if($.callbacks[what] !== null) {
      field.movement.removeCallback($.callbacks[what]);
      $.callbacks[what] = null;
    }
  },
  bonusTimer: function() {
    var $ = this._.private;
    if(!$.bonusTimer[2]) return;
    if(++$.bonusTimer[0] === $.bonusTimer[1]) {
      $.bonusTimer[2] = false;
      if(toss(superFoodChance[3]()))
        $.superFood(); else $.bonusFood();
    }
  }
};*/

/*

Přístupné funkce a atributy:
  food() - Naspawnuje standardní jídlo
  reset() - Nastaví proměnné
  set() - Nastaví odpočítávání bonusového jídla
  bonusTimer() - Funkce, která se nalepí na lifeTimeManager addCallbackem

*/

function calcBonusFoodSpawn(length) {
  return Math.round((
           (1 - ((1 - spawnDelay[4]) * ScalingSystem.get().abs() / 10)) *
           ((spawnDelay[0] + Math.random() * (spawnDelay[1] - spawnDelay[0])) +
           (spawnDelay[2] + (1 - length / maxEaten) * spawnDelay[3]))
         ) / maxInterval);
};