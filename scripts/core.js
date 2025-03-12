var Ego,
    canvas,
    container,
    listener, originalGridColor = "#EAEAEA",
    originalBackgroundColor = "#FFFFFF",
    gridColors = [
      ["#D0D0D0", "#F8F8F8"], // Grey
      ["#60A800", "#C8FF95"], // Green
      ["#B7BC23", "#FFFFB9"], // Gold
      ["#DF3500", "#FFAEAE"], // Red
      ["#A92FFF", "#D09DFF"], // Violet
      ["#0088FF", "#BCDFFF"], // Blue
      ["#FF9C2E", "#FFDEBD"]  // Orange
    ],
    textColors = [
      ["#0A3700","#7EDB4B","#FFFFFF","#000000"], // Green
      ["#414100","#E9DF3C","#FFFFFF","#000000"], // Gold
      ["#410000","#E7431E","#FFFFFF","#000000"], // Red
      ["#48003C","#C755FC","#FFFFFF","#000000"], // Violet
      ["#001D58","#AFD4F9","#FFFFFF","#000000"], // Blue
      ["#850000","#FF9C2E","#FFFFFF","#000000"], // Orange
      ["#AA0000","#FF9C2E","#FFFFFF","#000000"]  // Red-orange
    ],
    positionsCache,
    foodColors = ["#A92FFF","#60A800","#FFFFFF"],
    movesCounter = 0,
    centerGrowDrawQueue = [],
    centerGlowDrawEngaged = false,
    field, fieldElement,
    width, height,
    minwidth = 15, minheight = 15,
    paused = false,
    presetLength = 40, length,
    defaultLength = 2,
    starsSpans = [], starsAnim = [], stars = [],
    starsImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A /wD/oL2nkwAAAAlwSFlzAACNZgAAjWYBB0M1IwAAAAd0SU1FB9oIBAoMHHVA3+oAAAExSURBVBjT hY27SgNRAETP3YdZ8rBRi6CkkpBgrSIYIVgICn6GIFYBC7cUi6AWNuI32Is/YGFjQFQ0hQbEREEk MY/dzSabu9cionYODMMMBwb+yN0Bp0DO3TPP+E/ecfyid51RzVX0v7vm2r/F2WRSX5zKicwYZobz nycbDDVgxSmQ1lLRLJaxrqXHwVdKX5te9lLvp+rTKytXPgnv0Lo0t+cXAPBDlDNAuCF0JXQBP1SD m2og6oC1H3kY2ZrLKicYQp4ELwQ3ZHBXRb42ZjXLht5ubyY4KdVoSehIaA8dvjSRtUY+fkDJiBUB UG7L14UbgiOhO0wRAJKyY4MG0NnAFBOJJG2p1FsHeV9DBCgRi4LBaLz4DYo4CWGYBFeV236pkg+e G8l++fFIftQREX0J4Av08Y4EOdL+NQAAAABJRU5ErkJggg==",
    starsNumber = 3,
    reactionTime = 580,
    superFoodChance = [10, 4],
    bonusFoodHelper = 0,
    bonusFoodSpawned = null,
    bonusFoodSpawnMoves,
    bonusFoodHelperStep = 1,
    bonusFoodHelperStepBackwards = 6,
    foodEatenAnim,
    interval = 0, first = true,
    maxInterval, currInterval,
    isIE = "\v" === "v",
    isFirefox = navigator.userAgent.indexOf("Firefox/") != -1,
    isOpera = typeof window.opera === "object",
    maxScore, maxEaten,
    fieldClass = "nic",
    food = "jidlo",
    bonusFood = "bonusjidlo",
    superFood = "superjidlo",
    body = "telo",
    head = "hlava",
    collisionList = [
      body,
      head
    ];

Screen.onload = function() {
  load(function(){
    // Doèasné:
    game(true);
  });
}

function load(callback) {
  canvas = document.getElementById("canvas");
  listener = new Listener();
  // Browser hack - doèasné
  if(isIE) ScrollBarWidth = getScrollBarWidth();
  canvas.innerHTML = "";
  callback();
}

function reset() {
  width = Math.floor(Screen.clientDimensions[0] / presetLength);
  height = Math.floor(Screen.clientDimensions[1] / presetLength);
  width += Math.floor((width - 1) / (presetLength - 1 / width - 1));
  height += Math.floor((height - 1) / (presetLength - 1 / height - 1));
  if(width < minwidth || height < minheight) {
    presetLength = Math.min((width/minwidth),(height/minheight)) * presetLength;
    reset();
    return;
  }
  maxEaten = width * height - defaultLength - 1;
  maxInterval = calcInterval(10);
  field = new gameField(width, height, fieldClass, collisionList, lifeTimeManager);
  length = Math.min(presetLength - 1 / width - 1, presetLength - 1 / height - 1);
  if(fieldElement) canvas.removeChild(fieldElement);
  fieldElement = field.toHTML(length, length);
  length++;
  canvas.appendChild(fieldElement);
  fieldElement.cellSpacing = 1;
  fieldElement.style.left = Math.floor((Screen.clientDimensions[0] - fieldElement.offsetWidth) / 2) + "px";
  fieldElement.style.top = Math.floor((Screen.clientDimensions[1] - fieldElement.offsetHeight) / 2) + "px";
  positionsCache = [];
  for(var index = [0,]; index[0] < width; index[0]++) {
    positionsCache[index[0]] = [];
    for(index[1] = 0; index[1] < height; index[1]++) {
      positionsCache[index[0]][index[1]] = field.getPos(index[0], index[1]);
    }
  }
}

function clear() {
  paused = false;
  bonusFoodHelper = 0;
  movesCounter = 0;
  bonusFoodSpawned = null;
  AchievementBonusFoodCollect = [0,0];
  AchievementSuperFoodCollect = [0,0];
  AchievementsListener.detach();
  centerGrowDrawQueue = [];
  field.clear();
  field.movement.clearCallbacks();
  if(stars.length) undrawAllStars();
  clearInterval(interval);
  listener.stopListening();
}

function game(resetField) {
  // Browser hack - doèasné
  // celkovì doèasné - bude GUI
  var speed = isIE?8:Number(prompt(l[5],5));
  if(isNaN(speed) || speed > 10 || speed < 1) speed = 5;
  var collision = !confirm(l[8]); focus();
  // celkovì doèasné - bude GUI
  var score = 0;

  var scoreIncrease = function(increase) {
    score += increase;
    AchievementsListener.check(score);
  }

  if(resetField) {
    reset();
    PrepareAchievements(defaultLength, speed, ScoreAchievements, DynamicAchievementsList);
  }
  if(first)
    first = false;
  else clear();
  AchievementsListener.attach(DynamicAchievementsList);
  AchievementsListener.attach(StaticAchievementsList);

  currInterval = calcInterval(speed);
  Ego = new Snake(field, {
    head: head,
    body: body,
    speed: speed,
    length: defaultLength,
    automation: {
      movementManager: true,
      autoSpawn: true,
      drawStars: true
    },
    collision: {
      walls: collision?1:0, // 0: Collision with a wall makes the snake appear on the other side
                            // 1: Collision with a wall results in the snake's death
                            // 2: Collision with a wall makes the snake go behind the wall and disappear
      body: true,
      items: true
    },
    callbacks: {
      death: function() {
        clearInterval(interval);
        listener.stopListening();
        // AchievementsListener.check("death"); - Not needed atm
        centerDraw(3000,"#000000","#FFFFFF",length,
          "<b>"+l[6]+"</b><span class=\"score\" style=\"font-size: " + (length*1.2) + "px\">"+(score>=1000?score.group(length*1.1):score)+"</span>"+l[7]
        );
      },
      collision: function(x,y,get) {
        switch(get) {
          case food : {
            FullscreenGlow(currInterval * 6,gridColors[0],0);
            scoreIncrease(calcScore(Ego.length, Ego.speed));
            snakeDraw([x,y],0,"#000000","#FFFFFF","score",1,score>=1000?score.group(length*0.9):score);
            Ego.length++;
            if(!bonusFoodSpawned && bonusFoodSpawnMoves - movesCounter >= 3000 / currInterval)
                movesCounter += Math.round(1000 / currInterval);
            // - 1000 ms èekání na bonus, 3 sekundy se vždy ponechají
            field.remove(x,y);
            Ego.move(false);
            spawn(food);
            AchievementsListener.check(get);
            break;
          }
          case superFood :
          case bonusFood : {
            FullscreenGlow(currInterval * (get===superFood?15:10),gridColors[get===superFood?4:1],get===superFood?4:1);
            var pointer = field.getElement(x,y);
            scoreIncrease(calcScore(Ego.length, Ego.speed, get===superFood?10:3));
            Ego.length += get===superFood?10:3;
            bonusFoodSpawned.remove();
            bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + defaultLength);
            snakeDraw([x,y],1000,(get===bonusFood?"#3A7000":"#9E1DB6"),"#FFFFFF","score",get===bonusFood?1.3:1.6,score>=1000?score.group(length*(get===bonusFood?1.3:1.6)*0.9):score);
            field.remove(x,y);
            setOpacity(pointer, 100);
            Ego.move(false);
            AchievementsListener.check(get);
            if(AchievementBonusFoodFading) AchievementBonusFoodFading = false;
            break;
          }
          default: {
          }
        }
      },
      directionChange: function() {
        AchievementsListener.check("changeDirection");
      },/*
      lengthChange: function(length) {
      },*/
      move: function() {
        //AchievementsListener.check("move"); - Not needed atm
        movesCounter++;
        // For testing purposes only, displays the remaining turns to the de/spawning of the bonus food
        // if(bonusFoodSpawned) snakeDraw(Ego.position,0,foodColors[bonusFoodSpawned.extra?0:1],"#000000","score",0.6,bonusFoodSpawned.lifetime - movesCounter === Infinity?"Anim":bonusFoodSpawned.lifetime - movesCounter);
        // else snakeDraw(Ego.position,0,"#000000","#FFFFFF","score",0.6,bonusFoodSpawnMoves - movesCounter);
        if(bonusFoodSpawned && movesCounter >= bonusFoodSpawned.lifetime) {
          bonusFoodSpawned.lifetime = Infinity;
          if(bonusFoodSpawned.extra) {
            bonusFoodSpawned.warp();
          } else {
            bonusFoodSpawned.despawn();
          }
        }
        if(!bonusFoodSpawned && movesCounter >= bonusFoodSpawnMoves) {
          movesCounter = 0;
          spawn(Math.random()<1/(superFoodChance[1] + (1 - Ego.length / (width * height)) * (superFoodChance[0] - superFoodChance[1]))?superFood:bonusFood);
        }
      }
    },
    position: [Math.round((width-1)/2), Math.round((height-1)/2)],
    direction: Math.round(Math.random()*3)
  });

  spawn(food);
  bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
  maxScore = calcScore(Ego.length, Ego.speed, width*height - Ego.length);
  interval = window.setInterval(field.movement.perform, currInterval);

  listener.startListening([LEFT,UP,RIGHT,DOWN,PAUSE], function(result) {
    if(result < 4 && !paused) Ego.changeDirection(result);
    else if(result === 4) {
      if(!paused) {
        centerDraw(1000,"#000000","#FFFFFF",length,l[11]);
        clearInterval(interval);
        paused = true;
      } else {
        paused = false;
        interval = window.setInterval(field.movement.perform, currInterval);
      }
    }
  });
}

function gameField(width, height, fieldClass, collisionList, manager) {
  var field = [],
      Objectfield = [],
      HTMLfield = [],
      lifeTimeManager = this.lifeTimeManager = new manager();
  this.collisionList = collisionList;
  this.isFull = false;
  this.toHTML = function(tdWidth, tdHeight) {
    var table = document.createElement("table"),
        tbody = document.createElement("tbody"),
        tr, td;
        table.className = "gameField";
    for(var count = 0; count < height; count++) {
      tr = document.createElement("tr");
      for(var count2 = 0; count2 < width; count2++) {
        td = document.createElement("td");
        if(tdWidth) td.style.width = tdWidth + "px";
        if(tdHeight) td.style.height = tdHeight + "px";
        if(field[count] && field[count][count2]) td.className = field[count][count2];
        else td.className = fieldClass;
        tr.appendChild(td);
        if(!HTMLfield[count2]) HTMLfield[count2] = [];
        HTMLfield[count2][count] = td;
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    pointer = table;
    return table;
  }
  this.spawn = function(x, y, what, lifeTime) {
    if(typeof lifeTime === "number")
      lifeTimeManager.set(x, y, lifeTime);
    else if((this.collisionList.indexOf(what) > -1 &&
            (!field[x] || !this.collisionList.indexOf(field[x][y])))) {
      if(typeof lifeTime != "number")
        return;
      else lifeTimeManager.set(x, y, lifeTime);
    }
    var changes = !(field[x] && field[x][y]);
    if(!field[x]) field[x] = [];
    field[x][y] = what;
    if(HTMLfield[x] && HTMLfield[x][y]) HTMLfield[x][y].className = what;
    if(changes && this.getFree().length === 0 && !this.isFull) this.isFull = true;
  }
  this.copy = function(x, y, x2, y2, lifeTime) {
    if(typeof lifeTime === "number")
      lifeTimeManager.set(x2, y2, lifeTime);
    else if((this.collisionList.indexOf(what) > -1 &&
            (!field[x] || !this.collisionList.indexOf(field[x][y])))) {
      if(typeof lifeTime != "number")
        return;
      else lifeTimeManager.set(x2, y2, lifeTime);
    }
    var changes = !(field[x2] && field[x2][y2]);
    if(!field[x]) field[x] = [];
    if(!field[x2]) field[x2] = [];
    field[x2][y2] = field[x][y];
    if(HTMLfield[x2] && HTMLfield[x2][y2]) HTMLfield[x2][y2].className = field[x][y];
    if(changes && this.getFree().length === 0 && !this.isFull) this.isFull = true;
  }
  this.move = function(x, y, x2, y2, lifeTime) {
    if(typeof lifeTime === "number") {
      lifeTimeManager.remove(x, y, lifeTime);
      lifeTimeManager.set(x2, y2, lifeTime);
    }
    else if((this.collisionList.indexOf(what) > -1 &&
            (!field[x] || !this.collisionList.indexOf(field[x][y])))) {
      if(typeof lifeTime != "number")
        return;
      else {
        lifeTimeManager.remove(x, y, lifeTime);
        lifeTimeManager.set(x2, y2, lifeTime);
      }
    }
    if(!field[x]) field[x] = [];
    if(!field[x2]) field[x2] = [];
    field[x2][y2] = field[x][y];
    if(HTMLfield[x2] && HTMLfield[x2][y2]) HTMLfield[x2][y2].className = field[x][y];
    field[x][y] = null;
    if(HTMLfield[x] && HTMLfield[x][y]) HTMLfield[x][y].className = fieldClass;
  }
  this.remove = function(x, y) {
    if(!field[x]) field[x] = [];
    if(this.isFull) this.isFull = false;
    field[x][y] = null;
    if(HTMLfield[x] && HTMLfield[x][y]) HTMLfield[x][y].className = fieldClass;
    lifeTimeManager.remove(x, y);
  }
  this.clear = function() {
    field = []; Objectfield = [];
    if(this.isFull) this.isFull = false;
    for(var count = 0; count < width; count++) {
      if(!HTMLfield[count]) HTMLfield[count] = [];
      for(var count2 = 0; count2 < height; count2++) {
        if(HTMLfield[count][count2]) HTMLfield[count][count2].className = fieldClass;
      }
    }
    lifeTimeManager.clear();
  }
  this.get = function(x,y) {
    return field[x] && field[x][y]?field[x][y]:false;
  }
  this.getElement = function(x,y) {
    return HTMLfield[x] && HTMLfield[x][y]?HTMLfield[x][y]:false;
  }
  this.getObject = function(x,y) {
    if(!Objectfield[x]) Objectfield[x] = [];
    if(!Objectfield[x][y]) Objectfield[x][y] = {};
    return Objectfield[x][y];
  }
  this.clearObject = function(x,y) {
    if(!Objectfield[x] || !Objectfield[x][y]) return false;
    for(var z in Objectfield[x][y]) {
      delete Objectfield[x][y][z];
    }
    return true;
  }
  this.getFree = function() {
    var places = [],
    count, count2;
    for(count = 0; count < width; count++) {
      if(!field[count]) {
        for(count2 = 0; count2 < height; count2++) {
          places.push([count,count2]);
        }
      } else {
        for(count2 = 0; count2 < height; count2++) {
          if(!field[count][count2]) places.push([count,count2]);
        }
      }
    }
    return places;
  }
  this.getPos = function(x,y) {
    if(!HTMLfield[x] || !HTMLfield[x][y]) return false;
    var pos = findPos(HTMLfield[x][y]);
    if(pos[0] > Screen.clientDimensions[0]) pos[0] -= HTMLfield[x][y].offsetWidth;
    pos[1] += (HTMLfield[x][y].offsetHeight - length) - HTMLfield[x][y].offsetHeight / 2;
    return pos;
  }

  /* For testing purposes only
  var temp = lifeTimeManager.decrease, that = this;
  lifeTimeManager.decrease = function() {
    temp();
    HTMLfield.each(function(subfield, x) {
      subfield.each(function(td, y) {
        td.style.fontSize = "small";
        td.style.textAlign = "center";
        if(td.className === "hlava")
          td.style.color = "white";
        else
          td.style.color = "black";
        td.innerHTML = lifeTimeManager.get(x, y);
      });
    });
  } */

  var callbacks = [];
  this.movement = {
    addCallback: function(callback) {
      callbacks.push(callback);
    },
    removeCallback: function(callback) {
      callbacks.remove(callbacks.indexOf(callback));
    },
    clearCallbacks: function() {
      callbacks.length = 0;
    },
    perform: function() {
      callbacks.each(function(callback) {
        callback();
      });
      lifeTimeManager.decrease();
    }
  };
}

function lifeTimeManager() {
  if(!(this instanceof lifeTimeManager)) return;
  var container = [];
  if(!(lifeTimeManager.array instanceof Array))
    lifeTimeManager.array = [this];
  else
    lifeTimeManager.array.push(this);
  for(var count = 0; count < width; count++) {
    container[count] = [];
    for(var count2 = 0; count2 < height; count2++) {
      container[count][count2] = 0;
    }
  }
  this.destroy = function() {
    lifeTimeManager.array.remove(
      lifeTimeManager.array.indexOf(this)
    );
  }
  this.get = function(x, y) {
    if(!container[x] || typeof container[x][y] != "number")
      return 0;
    return container[x][y];
  }
  this.set = function(x, y, value) {
    if(!container[x] || typeof container[x][y] != "number" || container[x][y] >= value)
      return false;
    return container[x][y] = value;
  }
  this.decrease = function() {
    for(var count = 0; count < width; count++) {
      for(var count2 = 0; count2 < height; count2++) {
        if(container[count][count2])
          container[count][count2]--;
      }
    }
  }
  this.clear = function() {
    for(var count = 0; count < width; count++) {
      for(var count2 = 0; count2 < height; count2++) {
        if(container[count][count2])
          container[count][count2] = 0;
      }
    }
  }
  this.remove = function(x, y) {
    if(!container[x] || typeof container[x][y] != "number")
      return;
    if(container[x][y])
      container[x][y] = 0;
  }
}
lifeTimeManager.globalDecrease = function() {
  if(!this.array) return;
  this.array.each(function(field) {
    field.decrease();
  });
}
lifeTimeManager.globalClear = function() {
  if(!this.array) return;
  this.array.each(function(field) {
    field.clear();
  });
}
lifeTimeManager.globalRemove = function(x, y) {
  if(!this.array) return;
  this.array.each(function(field) {
    field.remove(x, y);
  });
}
lifeTimeManager.globalDestroy = function() {
  if(!this.array) return;
  this.array.length = 0;
}

function PrepareAchievements(snakeLength, speed, data, outputArray) {
  // Parse and consolidate the Dynamic Data
  var result = [], adopt = [], index = [], offsetArray, match, maxEaten = width * height - snakeLength, topEaten = 0, dynamicAmount = 0, minDynamicOffset = [0,0,0];
  data.each(function(data) {
    if(data.treshold && data.treshold.type === "eaten") {
      minDynamicOffset[0]++;
      minDynamicOffset[1] += data.treshold.amount - minDynamicOffset[2];
      minDynamicOffset[2] = data.treshold.amount;
      if(data.treshold.amount > topEaten)
        topEaten = data.treshold.amount;
    }
    if(data.text instanceof Array) {
      for(index[0] = data.text[1]; index[0] <= data.text[2]; index[0]++) {
        if(!data.treshold) dynamicAmount++;
        (data.colors === "adopt" ||
         data.sizeMultiplier === "adopt" ||
         data.delay === "adopt"?adopt:result).push({
          text: data.text[0][index[0]],
          colors: data.colors,
          sizeMultiplier: data.sizeMultiplier,
          delay: data.delay,
          score: data.treshold?(data.treshold.type === "score"?
                 data.treshold.amount:calcScore(snakeLength, speed, data.treshold.amount)):"$"
        });
      }
    } else {
      if(!data.treshold) dynamicAmount++;
      (data.colors === "adopt" ||
       data.sizeMultiplier === "adopt" ||
       data.delay === "adopt"?adopt:result).push({
          text: data.text,
          colors: data.colors,
          sizeMultiplier: data.sizeMultiplier,
          delay: data.delay,
          score: data.treshold?(data.treshold.type === "score"?
                  data.treshold.amount:calcScore(snakeLength, speed, data.treshold.amount)):"$"
        });
    }
  });
  minDynamicOffset = minDynamicOffset[1] / minDynamicOffset[0];
  adopt.each(function(adopt) {
    offsetArray = [];
    result.each(function(result) {
      if(typeof result.score === "number")
        offsetArray.push(Math.abs(result.score - adopt.score));
      else
        offsetArray.push(Infinity);
    });
    match = offsetArray.indexOf(Math.min.apply(Math, offsetArray));
    if(match < result.length - 2) match++; // We round the index of the array we're gonna adopt to up unless we are dealing with the top evaluation
    if(adopt.colors === "adopt")
      adopt.colors = result[match].colors;
    if(adopt.sizeMultiplier === "adopt")
      adopt.sizeMultiplier = result[match].sizeMultiplier;
    if(adopt.delay === "adopt")
      adopt.delay = result[match].delay;
    result.push(adopt);
  });
  for(index[0] = 0, index[1] = 1; index[0] < result.length; ) {
    if(result[index[0]].score === "$") {
      if((maxEaten - topEaten) / dynamicAmount > minDynamicOffset) {
        result[index[0]].score = calcScore(snakeLength, speed, topEaten + (maxEaten - topEaten) / dynamicAmount * index[1]);
        index[0]++; index[1]++;
      } else {
        result.remove(index[0]);
        dynamicAmount--;
      }
    } else index[0]++;
  }
  // Create an array of objects fit for the Achievements class
  if(outputArray.length > 0) outputArray.length = 0;
  result.each(function(field) {
    outputArray.push({
      count: false,
      repeat: false,
      allowedKeyWords: false,
      allowedKeyWordTypes: "number",
      condition : function(keyWord) {
        return keyWord >= field.score;
      },
      callback : function(keyWord) {
        centerGrowDraw(
          500,
          field.delay,
          textColors[field.colors][0],
          textColors[field.colors][1],
          textColors[field.colors][2],
          textColors[field.colors][3],
          length / 2,
          length * field.sizeMultiplier,
          field.text
        );
        FullscreenGlow(
          currInterval * 12,
          gridColors[field.colors < 6?field.colors + 1:field.colors],
          1
        );
      }
    });
  });
};

function Snake(field, opts) {
  if(!(field instanceof gameField) ||
     typeof opts != "object" ||
     !opts.head ||
     !opts.body ||
     opts.speed < 1 ||
     opts.speed > 10 ||
     opts.length <= 0 ||
     !(opts.position instanceof Array) ||
     opts.direction > 3 ||
     opts.direction < 0
  ) return;
  this.head = opts.head;
  this.body = opts.body;
  this.speed = opts.speed;
  this.length = opts.length;
  this.AI = opts.automation;
  this.callbacks = typeof opts.callbacks === "object"?opts.callbacks:{};
  if(this.AI.movementManager || this.AI.drawStars) {
    var formerDeathCallback = this.callbacks.death,
      deathCallback = function() {
        if(that.AI.movementManager)
          field.movement.removeCallback(moveScript);
        if(that.AI.drawStars)
          drawStars(that.position);
      };
      this.callbacks.death = function() {
        deathCallback();
        if(typeof formerDeathCallback === "function")
          formerDeathCallback();
      }
  }
  else
    this.callbacks = {};
  if(typeof opts.collision === "object")
    this.collision = opts.collision;
  else
    this.collision = {
      walls: 1,
      body: true,
      items: true
    };
  this.position = opts.position;
  this.direction = opts.direction;
  var newdirection = false, interval, length, that = this,
  lastCell = function(x,y) {
    return (length === that.length && x === that.history[Ego.history.length-1][0] && y === that.history[Ego.history.length-1][1]);
  }
  this.spawn = function() {
    this.history = [];
    var x = this.position[0];
    var y = this.position[1];
    if(field.get(x,y) === food) spawn(food);
    field.spawn(x, y, this.head, this.length);
    for(var count = 0; count < this.length; count++) {
      if(this.direction === 0) x++;
      if(this.direction === 1) y++;
      if(this.direction === 2) x--;
      if(this.direction === 3) y--;
      if(field.get(x, y) === food) spawn(food);
      field.spawn(x, y, this.body, this.length - 1 - count);
      this.history[count] = [x,y];
    }
    length = this.length;
    if(this.AI.movementManager)
      field.movement.addCallback(moveScript);
  }
  this.changeDirection = function(direction) {
    var changed = false;
    if(this.direction === 0 && direction != 0 && direction != 2 && (changed = true)) newdirection = direction;
    else if(this.direction === 1 && direction != 1 && direction != 3 && (changed = true)) newdirection = direction;
    else if(this.direction === 2 && direction != 0 && direction != 2 && (changed = true)) newdirection = direction;
    else if(this.direction === 3 && direction != 1 && direction != 3 && (changed = true)) newdirection = direction;
    if(direction === newdirection &&
       changed === true &&
       typeof this.callbacks.directionChange === "function")
        this.callbacks.directionChange(newdirection);
  }
  this.move = function(callback) {
    if(newdirection !== false) {
      this.direction = newdirection;
      newdirection = false;
    }
    var x = this.position[0];
    var y = this.position[1];
    if(this.direction === 0) x--;
    if(this.direction === 1) y--;
    if(this.direction === 2) x++;
    if(this.direction === 3) y++;
    if((x < 0 || x >= width || y < 0 || y >= height) && !this.collision.walls) {
      if(x < 0) x = width - 1;
      if(x >= width) x = 0;
      if(y < 0) y = height - 1;
      if(y >= height) y = 0;
    }
    var get = field.get(x,y);
    var last = get?lastCell(x, y):false;
    if(get && !last && get === this.body && this.collision.body) {
      if(this.callbacks.death) this.callbacks.death();
    } else if(get && !last && get != this.body && this.collision.items) {
      if(field.collisionList.indexOf(get) > -1) {
        if(this.callbacks.death) this.callbacks.death();
      } else
        if(this.callbacks.collision) this.callbacks.collision(x, y, get);
    } else if((x < 0 || x >= width || y < 0 || y >= height) && this.collision.walls === 1) {
      if(this.callbacks.death) this.callbacks.death();
    } else {
      var increaseSize = false;
      if(length != this.length) {
        increaseSize = true;
        length++;
        if(this.callbacks.lengthChange) this.callbacks.lengthChange(length);
      }
      this.history.unshift(this.position.slice(0));
      if(this.collision.body) {
        field.spawn(x, y, this.head, this.length + 1);
        // Non-strict redrawing
        if(this.position[0] >= 0 &&
           this.position[0] < width &&
           this.position[1] >= 0 &&
           this.position[1] < height)
          field.spawn(this.position[0], this.position[1], this.body);
          if(!increaseSize && !(
            this.history[this.history.length - 1][0] === x &&
            this.history[this.history.length - 1][1] === y
          )) field.remove(this.history[this.history.length - 1][0], this.history[this.history.length - 1][1]);
        // Refreshing the lifeTimeManager values
        if(increaseSize) {
          this.history.each(function(position, index) {
            field.lifeTimeManager.set(position[0], position[1],
                                      that.length - index);
          });
        }
      }
      this.position = [x, y];
      if(!this.collision.body) {
        last = true;
        // Too strict, not needed unless the snake can go through its own body
        this.history.each(function(history, index) {
          if(history[0] >= 0 &&
             history[0] < width &&
             history[1] >= 0 &&
             history[1] < height) {
            if(index < that.history.length - 1) {
              if(history[0] === that.history[that.history.length - 1][0] &&
                 history[1] === that.history[that.history.length - 1][1])
              last = false;
              field.spawn(history[0], history[1], that.body,
                          increaseSize?that.length - index:undefined);
            }
            else if(last && !increaseSize && !(
                    that.history[that.history.length - 1][0] === x &&
                    that.history[that.history.length - 1][1] === y
                  )) field.remove(history[0], history[1]);
          }
        });
      }
      if(!increaseSize) this.history.pop();
      if(!this.collision.body)
        field.spawn(x, y, this.head, this.length + 1);
      if(callback && this.callbacks.move) this.callbacks.move();
    }
  }
  if(this.AI.movementManager)
    var moveScript = function() {
      that.move(true);
    }
  if(this.AI.autoSpawn)
    that.spawn();
}

function calcInterval(speed) { /* Obsolete and rather hacky code
  return Math.round(((800 - ((9-(speed-1))*(800/10))) * ((Math.min(width,height)-Math.min(minheight,minwidth)>0?Math.min(width,height)-Math.min(minheight,minwidth):0) / 20) // Zpomalení pro vìtší hrací pole, Math.min(minheight,minwidth) políèek: 0 sekund, pak 800 - 800/6 (10 - 1 speed) ms po 20 políèkách
    + (11 - speed) * 1000) / ((width+height) / 2)); // 8 sekund na pøejetí prùmìru kratší a delší strany pøi nejpomalejším módu, 1 pøi nejrychlejším
  */
  return (5000 - (speed - 1) * (4450 / 9)) / ((minwidth + minheight) / 2);
  // 5 sekund na pøejetí prùmìru kratší a delší strany pøi nejpomalejším módu, 550ms pøi nejrychlejším
}

function calcScore(length, speed, multi) {
  if(multi) { // If we wanna add a multiplication of some score, but don't wanna lose the per-length bonus
    if(multi > (width * height) - (length + 1))
      multi = (width * height) - (length + 1);
    for(var score = 0; multi > 0; multi--) {
      score += Math.round((1 + (speed-1) * 4/9) // 1 - 5x bonus za rychlost
      //* (1 + 2*((length + 1) / (width * height))) - 1 - 3x bonus za zaplnìní plochy (3x pokud zabírá had veškerá pole) - DISABLED
      * (length + 1) / 3); // Základní bodování - 1 bod za každá 3 políèka délky hada
      length++;
    }
    return score;
  } else {
    if((width * height) - (length + 1) >= 1)
      return Math.round((1 + (speed-1) * 4/9) // 1 - 5x bonus za rychlost
      //* (1 + 2*((length + 1) / (width * height))) -  1 - 3x bonus za zaplnìní plochy (3x pokud zabírá had veškerá pole) - DISABLED
        * (length + 1) / 3); // Základní bodování - 1 bod za každá 3 políèka délky hada
    else return 0;
  }
}

function calcDistance(loc, tar, collision) {
  var distX, distY;
  if(!collision) {
    var middle = [];
    loc = loc.slice(0);
    tar = tar.slice(0);
    var loc2 = loc.slice(0);
    var tar2 = tar.slice(0);
    if(width/2 & 1) {
      middle[0] = Math.floor(width/2);
      middle[1] = Math.floor(height/2);
      if(loc[0] > middle[0]) loc[0] = middle[0] - (loc[0] - middle[0]);
      if(tar[0] > middle[0]) tar[0] = middle[0] - (tar[0] - middle[0]);
      if(loc[1] > middle[1]) loc[1] = middle[1] - (loc[1] - middle[1]);
      if(tar[1] > middle[1]) tar[1] = middle[1] - (tar[1] - middle[1]);
    } else {
      middle[0] = (width/2)-1;
      middle[1] = (height/2)-1;
      if(loc[0] > middle[0]) loc[0] = middle[0] - (loc[0] - middle[0]) + 1;
      if(tar[0] > middle[0]) tar[0] = middle[0] - (tar[0] - middle[0]) + 1;
      if(loc[1] > middle[1]) loc[1] = middle[1] - (loc[1] - middle[1]) + 1;
      if(tar[1] > middle[1]) tar[1] = middle[1] - (tar[1] - middle[1]) + 1;
    }
    distX = Math.min(loc[0] + tar[0], Math.abs(loc2[0] - tar2[0]));
    distY = Math.min(loc[1] + tar[1], Math.abs(loc2[1] - tar2[1]));
    //alert("X dist: " + distX + "\nY dist: " + distY + "\ntar, loc: " + tar.join(", ") + " - " + loc.join(", ") + "\ntar2, loc2: " + tar2.join(", ") + " - " + loc2.join(", "));
  } else {
    distX = Math.abs(loc[0] - tar[0]);
    distY = Math.abs(loc[1] - tar[1]);
    //alert("X dist: " + distX + "\nY dist: " + distY);
  }
  return distX + distY;
}

function calcBonusFoodSpawn(length) {
  return Math.round((0.45 + (10-bonusFoodHelper)*0.055) * (6000+Math.random()*10000) / maxInterval);
  // 6000 - 16000 ms (2700 - 7200 pokud je helper plný) v tazích (poèítá se z intervalu na tah podle maximální rychlosti)
}

function FullscreenGlow(duration,color,importance) {
  if(ChangingColor && FullscreenEffects && ((foodEatenAnim && (importance > foodEatenAnim.importance || (importance === foodEatenAnim.importance && color === foodEatenAnim.color))) || !foodEatenAnim)) {
    var count = 0;
    if(foodEatenAnim) {
      foodEatenAnim.anim[0]();
      foodEatenAnim.anim[1]();
    }
    foodEatenAnim = {
      "importance":importance,
      "color":color,
      anim: [recolor(duration,color[0],originalGridColor,function(color) {
        fieldElement.style.backgroundColor = color;
      }, function() {
        count++;
        if(count === 2) foodEatenAnim = false;
      }),
      recolor(duration,color[1],originalBackgroundColor,function(color) {
        (document.body || document.documentElement).style.backgroundColor = color;
      }, function() {
        count++;
        if(count === 2) foodEatenAnim = false;
      })]
    }
  }
}

function drawStars(position) {
  position = positionsCache[position[0]][position[1]];
  var masterIndex = starsSpans.length;
  var innerElement = document.createElement("span");
  innerElement.style.position = "relative";
  innerElement.style.height = innerElement.style.width = length + "px";
  var eclipse = calculateEllipse(true, length / 2, length / 2, length / 2, length / 6, 0, FramesPerSecond);
  var index = [];
  for(var count = 1; count <= starsNumber; count++) {
    if(count === starsNumber) index.push(eclipse.length-1);
    else index.push(Math.round((eclipse.length-1)/starsNumber*count));
    stars.push(document.createElement("img"));
    stars[stars.length-1].src = starsImage;
    stars[stars.length-1].style.width = stars[stars.length-1].style.height = (length/3) + "px";
    stars[stars.length-1].style.position = "absolute";
    stars[stars.length-1].style.left = (eclipse[index[stars.length-1]][0] - (eclipse[index[stars.length-1]][0]/length)*length/3) + "px"; // Smrštìní se na velikost jednoho pole
    stars[stars.length-1].style.top = eclipse[index[stars.length-1]][1] + (length/2) - (length/6) + "px";
    innerElement.appendChild(stars[stars.length-1]);
  }
  starsSpans.push(document.createElement("span"));
  starsSpans[masterIndex].style.position = "absolute";
  starsSpans[masterIndex].style.left = (position[0]<Screen.clientDimensions[0] - length?position[0]:Screen.clientDimensions[0] - length) + "px";
  starsSpans[masterIndex].style.top = (position[1]<Screen.clientDimensions[1]-length?position[1]:Screen.clientDimensions[1]-length) + "px";
  starsSpans[masterIndex].appendChild(innerElement);
  canvas.appendChild(starsSpans[masterIndex]);
  starsAnim.push(setInterval(function() {
    for(var count=0; count<index.length; count++) {
      index[count]++; index[count] %= eclipse.length-1;
      stars[count].style.left = (eclipse[index[count]][0] - (eclipse[index[count]][0]/length)*length/3) + "px"; // Smrštìní se na velikost jednoho pole
      stars[count].style.top = (eclipse[index[count]][1] + (length/2) - (length/6)) + "px";
    }
  },1000 / FramesPerSecond));
}

function undrawStars(index) {
  if(index > starsSpans.length-1) return false;
  window.clearInterval(starsAnim[index]);
  canvas.removeChild(starsSpans[index]);
  stars.splice(index,1);
  starsAnim.splice(index,1);
  return true;
}

function undrawAllStars() {
  if(starsSpans.length === 0) return false;
  starsSpans.each(function(span, index) {
    window.clearInterval(starsAnim[index]);
    canvas.removeChild(span);
    stars.splice(index, 3);
    starsAnim.splice(index, 3);
    starsSpans.splice(index, 1);
  });
  return true;
}

function snakeDraw(position,delay,textColor,shadowColor,className,sizeMultiplier,text) {
  if(delay <= 0) delay = 1;
  var timeout = [];
  var x = position[0];
  var y = position[1];
  position = positionsCache[x][y];
  position = [(isNaN(Math.round(position[0]))?0:Math.round(position[0])), (isNaN(Math.round(position[1]))?0:Math.round(position[1]))];
  var score = document.createElement("div");
  score.className = className?"absolutePositionedText snakeDraw " + className:"absolutePositionedText snakeDraw";
  score.style.color = textColor;
  if(TextGlowEffectsOnSnakeAndCenterText && TextGlowEffects) setGlow(score,GlowMagnitude,shadowColor);
  score.style.height=(sizeMultiplier*length)+"px";
  score.style.fontSize=(sizeMultiplier*length)+"px";
  score.innerHTML = text;
  canvas.appendChild(score);
  if(MovingObjects) timeout[0] = textMove(score,delay + 1000,position[0]+(length-score.offsetWidth)/2,position[1] < (TextGlowEffects?GlowMagnitude/2:0)?(TextGlowEffects?GlowMagnitude/2:0):position[1],position[0]+(length-score.offsetWidth)/2,position[1] + (TextGlowEffects?GlowMagnitude/2:0) + 2*(position[1] + (TextGlowEffects?GlowMagnitude/2:0) + 2*(-sizeMultiplier*length)<=0?sizeMultiplier*length:-sizeMultiplier*length),TextGlowEffects?GlowMagnitude:false,true);
  else {
    score.style.left = position[0]+(length-score.offsetWidth)/2;
    score.style.top = position[1] + (TextGlowEffects?GlowMagnitude/2:0) + 0.75*(position[1] + (TextGlowEffects?GlowMagnitude/2:0) + 0.75*(-sizeMultiplier*length)<=0?sizeMultiplier*2*length:-sizeMultiplier*length)
  }
  if(TransparencyOnSnakeText) {
    setTimeout(function(){timeout[1] = retransparent(score, 1000, 100, 0)},delay);
  } else {
    setTimeout(function(){hide(score);},delay + 1000);
  }
  setTimeout(function(){if(timeout[0])timeout[0]();if(timeout[1])timeout[1]();hide(score);canvas.removeChild(score);},delay + 1000);
}

function centerDraw(delay,textColor,shadowColor,size,text) {
  if(delay <= 0) delay = 1;
  var timeout = [];
  var score = document.createElement("div");
  score.className = "absolutePositionedText centerDraw";
  score.style.color = textColor;
  if(TextGlowEffectsOnSnakeAndCenterText && TextGlowEffects) setGlow(score,GlowMagnitude,shadowColor);
  score.style.fontSize=size+"px";
  score.innerHTML = text;
  canvas.appendChild(score);
  if(MovingObjects) timeout[0] = textMove(score,delay + 1000,Screen.clientDimensions[0] / 2 - score.offsetWidth / 2,Screen.clientDimensions[1] / 2 - size / 2,Screen.clientDimensions[0] / 2 - score.offsetWidth / 2,Screen.clientDimensions[1] / 2 - size * 2,TextGlowEffects?GlowMagnitude:false,true);
  else {
    score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2) + "px";
    score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2) + "px";
  }
  if(Transparency) {
    setTimeout(function(){timeout[1] = retransparent(score, 1000, 100, 0)},delay);
  } else {
    setTimeout(function(){hide(score);},delay + 1000);
  }
  setTimeout(function(){if(timeout[0])timeout[0]();if(timeout[1])timeout[1]();hide(score);canvas.removeChild(score);},delay + 1000);
}

function centerGrowDraw(flightDelay,delay,textColor,finalTextColor,shadowColor,finalShadowColor,size,finalSize,text,inner) {
  if(centerGlowDrawEngaged && !inner) {
    centerGrowDrawQueue.push([flightDelay,delay,textColor,finalTextColor,shadowColor,finalShadowColor,size,finalSize,text,true]);
    return;
  }
  centerGlowDrawEngaged = true;
  if(delay <= 0) delay = 1;
  var score = document.createElement("div");
  score.className = "absolutePositionedText glowText";
  score.style.color = textColor;
  if(TextGlowEffects) setGlow(score,GlowMagnitude,shadowColor);
  score.style.fontSize=(ResizingTexts?size:finalSize)+"px";
  score.innerHTML = text;
  if(Transparency) setOpacity(score, 0);
  canvas.appendChild(score);
  if(Transparency) retransparent(score,flightDelay/2,0,100);
  if(RotatingObjects) rotate(score,flightDelay,0,360,function(){
    score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
    score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
  });
  if(ResizingTexts) textResize(score,flightDelay,size,finalSize,function() {
    score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
    score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
  },function(){
    score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
    score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
    var sizeInterval = ResizingTexts&&Transparency&&GlowTextHidingAndEnlarging?window.setTimeout(
      function() {
        sizeInterval = textResize(score,GlowTextHidingDelay,finalSize,(((Math.min(Screen.clientDimensions[0]/score.offsetWidth,Screen.clientDimensions[1]/score.offsetHeight)-1)*0.7)+1)>=2?2*finalSize:(((Math.min(Screen.clientDimensions[0]/score.offsetWidth,Screen.clientDimensions[1]/score.offsetHeight)-1)*0.7)+1)*finalSize,function() {
          score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
          score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
        });
      },delay
    ):false;
    var colorInterval = ChangingColor?[
      finalTextColor!=textColor?recolor(delay,textColor,finalTextColor,function(color){
        score.style.color = color;
      }, function(){
        colorInterval[0] = false;
      }):false,
      finalShadowColor!=shadowColor && TextGlowEffects?recolor(delay,shadowColor,finalShadowColor,function(color){
        setGlow(score,GlowMagnitude,color);
      }, function(){
        colorInterval[1] = false;
      }):false
    ]:[false,false];
    if(Transparency) {
      setTimeout(function(){
        retransparent(score, GlowTextHidingDelay, 100, 0,function(){
          if(sizeInterval) {
            if(typeof sizeInterval === "function") sizeInterval();
            else window.clearTimeout(sizeInterval);
          }
          if(colorInterval[0]) colorInterval[0]();
          if(colorInterval[1]) colorInterval[1]();
          hide(score);
          canvas.removeChild(score);
          if(centerGrowDrawQueue.length > 0) {
            centerGrowDraw.apply(this,centerGrowDrawQueue[0]);
            centerGrowDrawQueue = centerGrowDrawQueue.slice(1);
          } else {
            centerGlowDrawEngaged = false;
          }
        })
      },delay);
    } else {
      setTimeout(function(){
        hide(score);
        if(sizeInterval) {
          if(typeof sizeInterval === "function") sizeInterval();
          else window.clearTimeout(sizeInterval);
        }
        if(colorInterval[0]) colorInterval[0]();
        if(colorInterval[1]) colorInterval[1]();
        hide(score);
        canvas.removeChild(score);
        if(centerGrowDrawQueue.length > 0) {
          centerGrowDraw.apply(this,centerGrowDrawQueue[0]);
          centerGrowDrawQueue = centerGrowDrawQueue.slice(1);
        } else {
          centerGlowDrawEngaged = false;
        }
      },delay + GlowTextHidingDelay);
    }
  });
  else {
    score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
    score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
    var colorInterval = ChangingColor?[
      finalTextColor!=textColor?recolor(delay,textColor,finalTextColor,function(color){
        score.style.color = color;
      }, function(){
        colorInterval[0] = false;
      }):false,
      finalShadowColor!=shadowColor && TextGlowEffects?recolor(delay,shadowColor,finalShadowColor,function(color){
        setGlow(score,GlowMagnitude,color);
      }, function(){
        colorInterval[1] = false;
      }):false
    ]:[false,false];
    if(Transparency) {
      setTimeout(function(){
        retransparent(score, 1000, 100, 0,function(){
          if(colorInterval[0]) colorInterval[0]();
          if(colorInterval[1]) colorInterval[1]();
          hide(score);
          canvas.removeChild(score);
          if(centerGrowDrawQueue.length > 0) {
            centerGrowDraw.apply(this,centerGrowDrawQueue[0]);
            centerGrowDrawQueue = centerGrowDrawQueue.slice(1);
          } else {
            centerGlowDrawEngaged = false;
          }
        })
      },delay);
    } else {
      setTimeout(function(){
        hide(score);
        clearInterval(interval[0]);
        clearInterval(interval[1]);
        hide(score);
        canvas.removeChild(score);
        if(centerGrowDrawQueue.length > 0) {
          centerGrowDraw.apply(this,centerGrowDrawQueue[0]);
          centerGrowDrawQueue = centerGrowDrawQueue.slice(1);
        } else {
          centerGlowDrawEngaged = false;
        }
      },delay + GlowTextHidingDelay);
    }
  }
}

function spawn(what) {
  if(field.isFull) return false;
  var funkce;
  switch(what) {
    case superFood:
    case bonusFood: {
      if(bonusFoodSpawned && typeof bonusFoodSpawned.anim === "function") {
        bonusFoodSpawned.anim();
        bonusFoodSpawned.anim = false;
      }
      AchievementBonusFoodFading = false;
      var position = pickOne(field.getFree()),
          interval = currInterval,
          calcLifetime = function() {
            return Math.round(7 + calcDistance(Ego.position, position, !!Ego.collision.walls) * (Ego.collision.walls?1:1.5));
          },
          lifetime = calcLifetime(),
          fadeInterval = interval * 5 <= lifetime * currInterval?interval * 5:lifetime * currInterval,
          // You get 1,5ice (once if walls off) the min. required time to get to the bonus food + two turns to be able to turn around
          // + 5 turns for the fadein.
          // ----------------------------------------------
          // Needs further reworking - a path-finding system!
          pointer = field.getElement(position[0],position[1]);
      bonusFoodSpawned = field.getObject(position[0],position[1]);
      bonusFoodSpawned.lifetime = Infinity; // Reakèní timeout, tahy se spoèítají a zaènou odpoèítávat až po daném poètu milisekund (~200 ms)
      var reactionTimeout = setTimeout(function() {
        reactionTimeout = false;
        bonusFoodSpawned.lifetime = lifetime;
      }, reactionTime);
      if(ChangingColor) {
        pointer.style.backgroundColor = foodColors[2];
        field.spawn(position[0],position[1],what);
        funkce = recolor(fadeInterval,foodColors[2],foodColors[what === superFood?0:1],function(color) {
          pointer.style.backgroundColor = color;
        }, function(){
          bonusFoodSpawned.anim = false;
          pointer.style.backgroundColor = "";
        });
        bonusFoodSpawned.anim = function() {
          funkce();
          pointer.style.backgroundColor = "";
        }
      } else if(Transparency) {
        cover(pointer);
        field.spawn(position[0],position[1],what);
        bonusFoodSpawned.anim = retransparent(pointer,fadeInterval,0,100,function(){
          bonusFoodSpawned.anim = false;
        });
      }
      // The warp effect is achieved using either transparency, or color changing
      bonusFoodSpawned.extra = what === superFood;
      bonusFoodSpawned.remove = function() {
        movesCounter = 0;
        if(reactionTimeout) {
          clearTimeout(reactionTimeout);
          reactionTimeout = false;
        }
        if(typeof this.anim === "function") {
          this.anim();
          this.anim = false;
        }
        field.clearObject(position[0],position[1]);
        bonusFoodSpawned = null;
        if(bonusFoodHelper > 0) {
          if(bonusFoodHelper <= bonusFoodHelperStepBackwards) bonusFoodHelper = 0;
          else bonusFoodHelper -= bonusFoodHelperStepBackwards;
        }
        field.clearObject(position[0],position[1]);
      }
      bonusFoodSpawned.despawn = function() {
        AchievementBonusFoodFading = true;
        var startTransparency = this.anim?getOpacity(pointer):100,
            time = this.anim?startTransparency/100*(fadeInterval):fadeInterval,
            despawn = function() {
              bonusFoodSpawned.anim = false;
              AchievementBonusFoodFading = false;
              field.remove(position[0],position[1]);
              field.clearObject(position[0],position[1]);
              AchievementsListener.check("missBonusFood");
              if(bonusFoodHelper <= 10 - bonusFoodHelperStep * (what === superFood?2:1)) bonusFoodHelper += (bonusFoodHelperStep * (what === superFood?2:1));
              else if(bonusFoodHelper < 10) bonusFoodHelper = 10;
              bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
              setOpacity(pointer, 100);
              bonusFoodSpawned = null;
              movesCounter = 0;
              field.clearObject(position[0],position[1]);
            };
        if(typeof this.anim === "function") {
          this.anim();
          this.anim = false;
        }
        if(ChangingColor) {
          funkce = recolor(fadeInterval,foodColors[1],foodColors[2],function(color) {
            pointer.style.backgroundColor = color;
          }, function(){
            bonusFoodSpawned.anim = false;
            pointer.style.backgroundColor = "";
            despawn();
          });
          this.anim = function() {
            funkce();
            pointer.style.backgroundColor = "";
            field.clearObject(position[0],position[1]);
          }
        } else if(Transparency) {
          funkce = retransparent(pointer,fadeInterval,100,0,function(){
            despawn();
          });
          this.anim = function() {
            funkce();
            field.clearObject(position[0],position[1]);
          }
        } else {
          var timeout = setTimeout(function(){
            AchievementBonusFoodFading = false;
            bonusFoodSpawned.anim = false;
            movesCounter = 0;
            field.remove(position[0],position[1]);
            field.clearObject(position[0],position[1]);
            AchievementsListener.check("missBonusFood");
            if(bonusFoodHelper <= 10 - bonusFoodHelperStep * (what === superFood?2:1)) bonusFoodHelper += (bonusFoodHelperStep * (what === superFood?2:1));
            else if(bonusFoodHelper < 10) bonusFoodHelper = 10;
            bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
          }, fadeInterval);
          this.anim = function() {
            window.clearTimeout(timeout);
            field.clearObject(position[0],position[1]);
          }
        }
      }
      if(what === superFood)
        bonusFoodSpawned.warp = function() {
          AchievementBonusFoodFading = true;
          if(typeof this.anim === "function") {
            this.anim();
            this.anim = false;
          }
          if(Transparency) setOpacity(pointer, 100);
          if(ChangingColor) {
            funkce = recolor(fadeInterval,foodColors[0],foodColors[1],function(color) {
              pointer.style.backgroundColor = color;
            }, function() {
              field.spawn(position[0],position[1],bonusFood);
              pointer.style.backgroundColor = "";
              AchievementBonusFoodFading = false;
              movesCounter = 0;
              bonusFoodSpawned.extra = false;
              bonusFoodSpawned.anim = false;
              bonusFoodSpawned.lifetime = calcLifetime();
              AchievementsListener.check("missSuperFood");
              bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
            });
            this.anim = function() {
              funkce();
              pointer.style.backgroundColor = "";
            }
          }
          else {
            var timeout = setTimeout(function(){
              field.spawn(position[0],position[1],bonusFood);
              pointer.style.backgroundColor = "";
              AchievementBonusFoodFading = false;
              movesCounter = 0;
              bonusFoodSpawned.extra = false;
              bonusFoodSpawned.anim = false;
              bonusFoodSpawned.lifetime = calcLifetime();
              AchievementsListener.check("missSuperFood");
              bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
            }, fadeInterval);
            this.anim = function() {
              window.clearTimeout(timeout);
              bonusFoodSpawned.anim = false;
            }
          }
        }
      break;
    }
    default: {
      position = pickOne(field.getFree());
      field.spawn(position[0],position[1],what);
    }
  }
}

function newThread(funct) {
  setTimeout(funct);
}

function getScrollBarWidth() {
  document.body.style.overflow = 'hidden';
  var width = document.body.clientWidth;
  document.body.style.overflow = 'scroll';
  width -= document.body.clientWidth;
  if(!width) width = document.body.offsetWidth - document.body.clientWidth;
  document.body.style.overflow = '';
  return width;
}

function pickOne(array) {
  return array[Math.ceil(Math.random() * array.length)-1];
}

function findPos(obj) {
  var curleft = [0,0];
  if(obj.offsetParent)
    while(obj.offsetParent) {
      curleft[0] += obj.offsetLeft;
      curleft[1] += obj.offsetTop;
      obj = obj.offsetParent;
    }
  else {
    if(obj.x)
      curleft[0] += obj.x;
    if(obj.y)
      curleft[1] += obj.y;
  }
  return curleft;
}

/*
 This functions returns an array containing 36 points to draw an
 ellipse.

 @param x {double} X coordinate
 @param y {double} Y coordinate
 @param a {double} Semimajor axis
 @param b {double} Semiminor axis
 @param angle {double} Angle of the ellipse
 @param round {boolean} Whether or not will the poits be rounded to a Number from a Float
 @param steps {int} Number of steps

*/
function calculateEllipse(round, x, y, a, b, angle, steps) {
  if(steps === null)
    steps = 36;
  var points = [];

  // Angle is given by Degree Value
  var beta = -angle * (Math.PI / 180); //(Math.PI/180) converts Degree Value into Radians
  var sinbeta = Math.sin(beta);
  var cosbeta = Math.cos(beta);

  for(var i = 0; i < 360; i += 360 / steps) {
    var alpha = i * (Math.PI / 180) ;
    var sinalpha = Math.sin(alpha);
    var cosalpha = Math.cos(alpha);
    if(round) points.push([Math.round(x + (a * cosalpha * cosbeta - b * sinalpha * sinbeta)), Math.round(a * cosalpha * sinbeta + b * sinalpha * cosbeta)]);
    else points.push([x + (a * cosalpha * cosbeta - b * sinalpha * sinbeta), (a * cosalpha * sinbeta + b * sinalpha * cosbeta)]);
  }

  return points;
}
