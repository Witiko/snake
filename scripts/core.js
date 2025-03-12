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
      ["#48003C","#C228FC","#FFFFFF","#000000"], // Violet
      ["#001D58","#AFD4F9","#FFFFFF","#000000"], // Blue
      ["#850000","#FF9C2E","#FFFFFF","#000000"], // Orange
      ["#AA0000","#FF9C2E","#FFFFFF","#000000"]  // Red-orange
    ],
    foodColors = ["#A92FFF","#60A800"],
    movesCounter = 0,
    centerGrowDrawQueue = [],
    centerGlowDrawEngaged = false,
    field, fieldElement,
    width, height, quarter,
    minwidth = 15, minheight = 15,
    paused = false,
    presetLength = 30, length,
    starsSpans = [], starsAnim = [],
    starsImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A /wD/oL2nkwAAAAlwSFlzAACNZgAAjWYBB0M1IwAAAAd0SU1FB9oIBAoMHHVA3+oAAAExSURBVBjT hY27SgNRAETP3YdZ8rBRi6CkkpBgrSIYIVgICn6GIFYBC7cUi6AWNuI32Is/YGFjQFQ0hQbEREEk MY/dzSabu9cionYODMMMBwb+yN0Bp0DO3TPP+E/ecfyid51RzVX0v7vm2r/F2WRSX5zKicwYZobz nycbDDVgxSmQ1lLRLJaxrqXHwVdKX5te9lLvp+rTKytXPgnv0Lo0t+cXAPBDlDNAuCF0JXQBP1SD m2og6oC1H3kY2ZrLKicYQp4ELwQ3ZHBXRb42ZjXLht5ubyY4KdVoSehIaA8dvjSRtUY+fkDJiBUB UG7L14UbgiOhO0wRAJKyY4MG0NnAFBOJJG2p1FsHeV9DBCgRi4LBaLz4DYo4CWGYBFeV236pkg+e G8l++fFIftQREX0J4Av08Y4EOdL+NQAAAABJRU5ErkJggg==",
    starsNumber = 3,
    superFoodChance = 10,
    bonusFoodSpawned = null,
    bonusFoodSpawnMoves,
    foodEatenAnim,
    interval = 0, first = true,
    maxInterval, currInterval,
    isIE = "\v" == "v",
    isFirefox = navigator.userAgent.indexOf("Firefox/") != -1,
    isOpera = typeof window.opera=="object",
    maxScore,
    fieldClass = "nic",
    food = "jidlo",
    bonusFood = "bonusjidlo",
    superFood = "superjidlo",
    body = "telo",
    head = "hlava";
    
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
  quarter = Math.round((width+height)/4);
  maxInterval = calcInterval(10);
  field = new gameField(width, height, fieldClass);
  length = Math.min(presetLength - 1 / width - 1, presetLength - 1 / height - 1);
  if(fieldElement) canvas.removeChild(fieldElement);
  fieldElement = field.toHTML(length, length);
  length++;
  canvas.appendChild(fieldElement);
  fieldElement.cellSpacing = 1;
  fieldElement.style.left = Math.floor((Screen.clientDimensions[0] - fieldElement.offsetWidth) / 2) + "px";
  fieldElement.style.top = Math.floor((Screen.clientDimensions[1] - fieldElement.offsetHeight) / 2) + "px";
}

function clear() {
  paused = false;
  AchievementBonusFoodCollect = [0,0];
  AchievementSuperFoodCollect = [0,0];
  centerGrowDrawQueue = [];
  field.clear();
  undrawAllStars();
  AchievementsListener.reset(AchievementsList);
  clearInterval(interval);
  listener.stopListening();
}

function game(resetField) {
  // Browser hack - doèasné
  // celkovì doèasné - bude GUI
  var speed = isIE?8:Number(prompt(l[5],5));
  if(isNaN(speed) || speed > 10 || speed < 1) speed = 5;
  var collision = /*!confirm(l[8])*/false; focus();
  // celkovì doèasné - bude GUI
  var score = 0;
  
  var moveScript = function() {
    Ego.move(true);
    movesCounter++;
    // For testing purposes only, displays the remaining turns to the de/spawning of the bonus food
    // if(bonusFoodSpawned) snakeDraw(Ego.position,0,foodColors[bonusFoodSpawned.extra?0:1],"#000000","score",0.6,(bonusFoodSpawned.lifetime - movesCounter));
    // else status = snakeDraw(Ego.position,0,"#000000","#FFFFFF","score",0.6,(bonusFoodSpawnMoves - movesCounter));
    if(bonusFoodSpawned && movesCounter == bonusFoodSpawned.lifetime) {
      if(bonusFoodSpawned.extra) {
        bonusFoodSpawned.warp();
      } else {
        bonusFoodSpawned.despawn();
      }
    }
    if(!bonusFoodSpawned && movesCounter >= bonusFoodSpawnMoves) {
      movesCounter = 0;
      spawnBonusFood(Math.random()<1/superFoodChance);
    }
  }
  
  var scoreIncrease = function(increase) {
    score += increase;
    AchievementsListener.check(score);
  }
  
  if(resetField) reset();
  if(first) first = false;
  else clear();
  
  currInterval = calcInterval(speed);
  maxScore = [calcMinAttainableScore(speed),
              calcMaxScore(speed),
              calcMaxAttainableScoreBonusFood(speed),
              calcMaxAttainableScoreSuperFood(speed)];
  movesCounter = 0;
  Ego = new Snake();
  Ego.head = head;
  Ego.body = body;
  
  Ego.directionChanged = function() {
    AchievementsListener.check("changeDirection");
  }
  
  Ego.lengthChanged = function(length) {
    bonusFoodSpawnMoves = calcBonusFoodSpawn(length + 1);
  }
  
  Ego.moveCallback = function() {
    AchievementsListener.check("move");
  }
  
  Ego.deathCallback = function() {
    clearInterval(interval);
    listener.stopListening();
    AchievementsListener.check("death");
    drawStars(Ego.position);
    centerDraw(3000,"#000000","#FFFFFF",length,
      "<b>"+l[6]+"</b><span class=\"score\" style=\"font-size: " + (length*1.2) + "px\">"+(score>=1000?score.group(length*1.1):score)+"</span>"+l[7]
    );
  }
  
  Ego.collisionCallback = function(x,y,get) {
    switch(get) {
      case food : {
        FullscreenGlow(currInterval * 6,gridColors[0],0);
        scoreIncrease(calcScore(Ego.length, Ego.speed));
        snakeDraw([x,y],0,"#000000","#FFFFFF","score",1,score>=1000?score.group(length*0.9):score);
        Ego.length++;
        if(!bonusFoodSpawned && calcBonusFoodSpawn(Ego.length+1)  - movesCounter >= 3000/currInterval) 
            movesCounter += Math.round(1000 / currInterval);
        // - 1000 ms èekání na bonus, 2 sekundy se vždy ponechají
        field.remove(x,y);
        Ego.move(false);
        spawn(food);
        AchievementsListener.check(get);
        break;
      }
      case superFood :
      case bonusFood : {
        FullscreenGlow(currInterval * (get==superFood?15:10),gridColors[get==superFood?4:1],get==superFood?4:1);
        var pointer = field.getElement(x,y);
        scoreIncrease(calcScore(Ego.length, Ego.speed) * (get==bonusFood?3:10));
        Ego.length++;
        movesCounter = 0;
        if(bonusFoodSpawned && typeof bonusFoodSpawned.anim == "function") {
          bonusFoodSpawned.anim();
          bonusFoodSpawned.anim = false;
        }
        bonusFoodSpawned = false;
        snakeDraw([x,y],1000,(get==bonusFood?"#3A7000":"#9E1DB6"),"#FFFFFF","score",get==bonusFood?1.3:1.6,score>=1000?score.group(length*(get==bonusFood?1.3:1.6)*0.9):score);
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
  }
  
  Ego.collision = collision;
  Ego.speed = speed;
  Ego.length = 2;
  Ego.position = [Math.round((width-1)/2), Math.round((height-1)/2)];
  Ego.direction = Math.round(Math.random()*3);
  Ego.spawn();
  spawn(food);
  bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
  interval = window.setInterval(moveScript, currInterval);
  
  listener.startListening([LEFT,UP,RIGHT,DOWN,PAUSE],function(result){
    if(result < 4 && !paused) Ego.changeDirection(result);
    else if(result == 4) {
      if(!paused) {
        paused = true;
        centerDraw(1000,"#000000","#FFFFFF",length,l[11]);
        clearInterval(interval);
      } else {
        paused = false;
        interval = window.setInterval(moveScript, currInterval);
      }
    }
  });
}

function gameField(width, height, fieldClass) {
  var field = [],
      Objectfield = [],
      HTMLfield = [];
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
  this.spawn = function(x, y, what) {
    var changes = !(field[x] && field[x][y]);
    if(!field[x]) field[x] = [];
    field[x][y] = what;
    if(HTMLfield[x] && HTMLfield[x][y]) HTMLfield[x][y].className = what;
    if(changes) {
      if(this.getFree().length == 0) {
        if(!this.isFull) this.isFull = true;
      } else {
        if(this.isFull) this.isFull = false;
      }
    }
  }
  this.copy = function(x, y, x2, y2) {
    var changes = !(field[x2] && field[x2][y2]);
    if(!field[x]) field[x] = [];
    if(!field[x2]) field[x2] = [];
    field[x2][y2] = field[x][y];
    if(HTMLfield[x2] && HTMLfield[x2][y2]) HTMLfield[x2][y2].className = field[x][y];
    if(changes) {
      if(this.getFree().length == 0) {
        if(!this.isFull) this.isFull = true;
      } else {
        if(this.isFull) this.isFull = false;
      }
    }
  }
  this.move = function(x, y, x2, y2) {
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
    if(!Objectfield[x] || !Objectfield[x][y]) return false
    return Objectfield[x][y] = {};
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
}

function Snake() {
  var newdirection = false, interval, length,
  lastCell = function(that,x,y) {return (x == that.history[Ego.history.length-1][0] && y == that.history[Ego.history.length-1][1]);}
  this.spawn = function() {
    this.history = [];
    var x = this.position[0];
    var y = this.position[1];
    if(field.get(x,y) == food) spawn(food);
    field.spawn(x,y,this.head);
    for(var count = 0; count < this.length; count++) {
      if(this.direction == 0) x++;
      if(this.direction == 1) y++;
      if(this.direction == 2) x--;
      if(this.direction == 3) y--;
      if(field.get(x,y) == food) spawn(food);
      field.spawn(x,y,this.body);
      this.history[count] = [x,y];
    }
    var that = this;
    length = this.length;
  }
  this.changeDirection = function(direction) {
    if(this.direction == 0 && direction != 0 && direction !=2) newdirection = direction;
    if(this.direction == 1 && direction != 1 && direction !=3) newdirection = direction;
    if(this.direction == 2 && direction != 0 && direction !=2) newdirection = direction;
    if(this.direction == 3 && direction != 1 && direction !=3) newdirection = direction;
    if(direction == newdirection) this.directionChanged(newdirection);
  }
  this.move = function(callback) {
    if(newdirection !== false) {
      this.direction = newdirection;
      newdirection = false;
    }
    var x = this.position[0];
    var y = this.position[1];
    if(this.direction == 0) x--;
    if(this.direction == 1) y--;
    if(this.direction == 2) x++;
    if(this.direction == 3) y++;
    if((x < 0 || x >= width || y < 0 || y >= height) && !this.collision) {
      if(x < 0) x = width-1;
      if(x >= width) x = 0;
      if(y < 0) y = height-1;
      if(y >= height) y = 0;
    }
    var get = field.get(x,y);
    var last = get?lastCell(this,x,y):false;
    if(get && !last) {
      if(get == this.body) this.deathCallback();
      else this.collisionCallback(x,y,get);
    } else if((x < 0 || x >= width || y < 0 || y >= height) && this.collision) {
      this.deathCallback();
    } else {
      var increaseSize = false;
      if(length != this.length) {
        increaseSize = true;
        length = this.length;
        this.lengthChanged(length);
      }
      this.history.unshift(this.position.slice(0));
      field.move(this.position[0],this.position[1],x,y);
      this.position = [x,y];
      for(var count = this.history.length - 1; count > 0; count --) {
        if(count == this.history.length - 1 && last) {
          field.spawn(this.history[count-1][0],this.history[count-1][1],this.body);
        } else {
          field.copy(this.history[count][0],this.history[count][1],this.history[count-1][0],this.history[count-1][1]);
        }
      }
      if(!increaseSize) {
        if(!last) field.remove(this.history[this.history.length-1][0],this.history[this.history.length-1][1]);
        this.history.pop();
      }
      if(callback) this.moveCallback();
    }
  }
}

/*function GUI() {
  var listeners = {};
  this.add = function(id, text) {
    listenets[id] = {
      "encasement" : document.createElement("td"),
      "output" : document.createElement("span")
    };
  }
  this.update = function(id, text) {
    listeners[id]["output"].innerHTML = text;
  }
  this.toHTML = function() {
    var table = document.createElement("table"),
    tbody = document.createElement("tbody"),
    tr = document.createElement("tr");
    table.className = "GUI";
//  for
  }
}*/

function calcInterval(speed) {
  return Math.round(((800 - ((9-(speed-1))*(800/10))) * ((Math.min(width,height)-Math.min(minheight,minwidth)>0?Math.min(width,height)-Math.min(minheight,minwidth):0) / 20) // Zpomalení pro vìtší hrací pole, Math.min(minheight,minwidth) políèek: 0 sekund, pak 800 - 800/6 (10 - 1 speed) ms po 20 políèkách
    + (11 - speed) * 1000) / ((width+height) / 2)); // 8 sekund na pøejetí prùmìru kratší a delší strany pøi nejpomalejším módu, 1 pøi nejrychlejším
}

function calcScore(length, speed, collision) {
  return Math.round((1 + (speed-1) * 4/9) // 1 - 5x bonus za rychlost
  * (1 + 2*((length + 1) / (width * height))) // 1 - 3x bonus za zaplnìní plochy (3x pokud zabírá had veškerá pole)
  * (length + 1) / 3); // Základní bodování - 1 bod za každá 3 políèka délky hada
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

function calcMaxScore(speed) { // Calculates max. score attainable by normal play
  var score = 0;
  var length = 3;
  var maxlength = width * height;
  var apxdistance = (1 - length / (width * height)) * (width + height) / 2;
  var interval = calcInterval(speed);
  while(length < maxlength) {
    var passed = 0;
    for(var bonus = calcBonusFoodSpawn(length) * currInterval; passed + apxdistance*interval + 
    (bonus - (passed + apxdistance*interval) >= 3000?1000:0)
     < bonus; passed += apxdistance*interval + 
    (bonus - (passed + apxdistance*interval) >= 3000?1000:0)) {
    // - 1000 ms èekání na bonus, 2 sekundy se vždy ponechají
      if(length >= maxlength) break;
      score += calcScore(length, speed);
      length++;
      bonus = calcBonusFoodSpawn(length) * currInterval;
      apxdistance = (1 - length / (width * height)) * (width + height) / 2;
    }
    if(length >= maxlength) break;
    score += calcScore(length, speed) * ((superFoodChance-1)*3+10)/superFoodChance;
    length++;
  }
  return Math.round(score);
}

function calcMaxAttainableScoreBonusFood(speed) { // Calculates max. score attainable by bonusfood hunting
  var score = 0;
  var length = 3;
  var maxlength = width * height;
  while(length < maxlength) {
    score += calcScore(length, speed) * ((superFoodChance-1)*3+10)/superFoodChance;
    length++;
  }
  return Math.round(score);
}

function calcMaxAttainableScoreSuperFood(speed) { // Calculates max. score attainable by superfood hunting
  var score = 0;
  var length = 3;
  var maxlength = width * height;
  while(length < maxlength) {
    score += calcScore(length, speed) * 10;
    length++;
  }
  return score;
}

function calcMinAttainableScore(speed) { // Calculates max. score attainable by eating normal food only
  var score = 0;
  var length = 3;
  var maxlength = width * height;
  while(length < maxlength) {
    score += calcScore(length, speed);
    length++;
  }
  return score;
}

function calcBonusFoodSpawn(length) {
  return Math.round((2000+(1 - length / (width * height))*10000) / maxInterval);
  // 2000 - 12000 ms v tazích (poèítá se z intervalu na tah)
}

function FullscreenGlow(duration,color,importance) {
  if(ChangingColor && FullscreenEffects && ((foodEatenAnim && (importance > foodEatenAnim.importance || (importance == foodEatenAnim.importance && color == foodEatenAnim.color))) || !foodEatenAnim)) {
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
        if(count == 2) foodEatenAnim = false;
      }),
      recolor(duration,color[1],originalBackgroundColor,function(color) {
        (document.body || document.documentElement).style.backgroundColor = color;
      }, function() {
        count++;
        if(count == 2) foodEatenAnim = false;
      })]
    }
  }
}

function drawStars(position) {
  position = field.getPos(position[0],position[1]);
  var masterIndex = starsSpans.length;
  var innerElement = document.createElement("span");
  innerElement.style.position = "relative";
  innerElement.style.height = innerElement.style.width = length + "px";
  var eclipse = calculateEllipse(true, length / 2, length / 2, length / 2, length / 6, 0, FramesPerSecond);
  var index = [];
  var stars = [];
  for(var count = 1; count <= starsNumber; count++) {
    if(count == starsNumber) index.push(eclipse.length-1);
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
      index[count] = index[count] < eclipse.length-1?index[count]+1:0;
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
  if(starsSpans.length == 0) return false;
  for(var index = 0; index < starsSpans.length; index++) {
    window.clearInterval(starsAnim[index]);
    canvas.removeChild(starsSpans[index]);
    stars.splice(index,1);
    starsAnim.splice(index,1);
  }
  return true;
}

function snakeDraw(position,delay,textColor,shadowColor,className,sizeMultiplier,text) {
  if(delay <= 0) delay = 1;
  var timeout = [];
  var x = position[0];
  var y = position[1];
  position = field.getPos(x,y);
  position = [(isNaN(Math.round(position[0]))?0:Math.round(position[0])), (isNaN(Math.round(position[1]))?0:Math.round(position[1]))];
  var score = document.createElement("div");
  score.className = "absolutePositionedText snakeDraw " + className;
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
            if(typeof sizeInterval == "function") sizeInterval();
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
          if(typeof sizeInterval == "function") sizeInterval();
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
  if(!field.isFull) {
    var position = pickOne(field.getFree());
    field.spawn(position[0],position[1],what);
  }
}

function spawnBonusFood(extra) {
  if(!field.isFull) {
    AchievementBonusFoodFading = false;
    var position = pickOne(field.getFree());
    var interval = currInterval;
    var pointer = field.getElement(position[0],position[1]);
    bonusFoodSpawned = field.getObject(position[0],position[1]);
    bonusFoodSpawned.lifetime = Math.round(7 + calcDistance(Ego.position, position, Ego.collision) * (Ego.collision?1:1.5));
    // You get 1,5ice (once if walls off) the min. required time to get to the bonus food + two turns to be able to turn around
    // + 5 turns for the fadein.
    if(Transparency) cover(pointer);
    field.spawn(position[0],position[1],extra?superFood:bonusFood);
    if(Transparency) {
      bonusFoodSpawned.anim = retransparent(pointer,interval * 5,0,100,function(){
        bonusFoodSpawned.anim = false;
      });
    }
    bonusFoodSpawned.extra = extra;
    bonusFoodSpawned.despawn = function(){
      AchievementBonusFoodFading = true;
      var startTransparency = bonusFoodSpawned.anim?getOpacity(pointer):100;
      var time = bonusFoodSpawned.anim?startTransparency/100*(interval * 5):interval * 5;
      if(bonusFoodSpawned.anim && typeof bonusFoodSpawned.anim == "function") {
        bonusFoodSpawned.anim();
        bonusFoodSpawned.anim = false;
      }
      if(Transparency) bonusFoodSpawned.anim = retransparent(pointer,time,startTransparency,0,function(){
        bonusFoodSpawned.anim = false;
        AchievementBonusFoodFading = false;
        field.remove(position[0],position[1]);
        AchievementsListener.check(extra?"missSuperFood":"missBonusFood");
        setOpacity(pointer, 100);
        bonusFoodSpawned = null,
        movesCounter = 0;
      });
      else {
        var timeout = setTimeout(function(){
          AchievementBonusFoodFading = false;
          bonusFoodSpawned.anim = false;
          movesCounter = 0;
          field.remove(position[0],position[1]);
          AchievementsListener.check(extra?"missSuperFood":"missBonusFood");
        }, interval * 5);
        bonusFoodSpawned.anim = function() {
          window.clearTimeout(timeout);
          bonusFoodSpawned.anim = false;
          bonusFoodSpawned = null;
        }
      }
    }
    bonusFoodSpawned.warp = function() {
      AchievementBonusFoodFading = true;
      if(bonusFoodSpawned.anim && typeof bonusFoodSpawned.anim == "function") {
        bonusFoodSpawned.anim();
        bonusFoodSpawned.anim = false;
      }
      if(Transparency) setOpacity(pointer, 100);
      if(ChangingColor) {
        var funkce = recolor(interval * 5,foodColors[0],foodColors[1],function(color) {
          pointer.style.backgroundColor = color;
        }, function() {
          field.spawn(position[0],position[1],bonusFood);
          pointer.style.backgroundColor = "";
          AchievementBonusFoodFading = false;
          movesCounter = 0;
          bonusFoodSpawned.extra = false;
          bonusFoodSpawned.anim = false;
          AchievementsListener.check("missSuperFood");
        });
        bonusFoodSpawned.anim = function() {
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
          AchievementsListener.check("missSuperFood");
        }, interval * 5);
        bonusFoodSpawned.anim = function() {
          window.clearTimeout(timeout);
          bonusFoodSpawned.anim = false;
        }
      }
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
        while(1) 
        {
          curleft[0] += obj.offsetLeft;
          curleft[1] += obj.offsetTop;
          if(!obj.offsetParent)
            break;
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
  if (steps == null)
    steps = 36;
  var points = [];
 
  // Angle is given by Degree Value
  var beta = -angle * (Math.PI / 180); //(Math.PI/180) converts Degree Value into Radians
  var sinbeta = Math.sin(beta);
  var cosbeta = Math.cos(beta);
 
  for (var i = 0; i < 360; i += 360 / steps) 
  {
    var alpha = i * (Math.PI / 180) ;
    var sinalpha = Math.sin(alpha);
    var cosalpha = Math.cos(alpha);
    if(round) points.push([Math.round(x + (a * cosalpha * cosbeta - b * sinalpha * sinbeta)), Math.round(a * cosalpha * sinbeta + b * sinalpha * cosbeta)]);
    else points.push([x + (a * cosalpha * cosbeta - b * sinalpha * sinbeta), (a * cosalpha * sinbeta + b * sinalpha * cosbeta)]);
   }
   
  return points;
}
// calculateEllipse(position[0], position[1], length, length / 2, 180, FramesPerSecond*2)
/*
var addCSSRule = (
  function() {
    var rules = {};
    return [function(name, property, value) {
      if (!document.styleSheets) return false;
      name = name.toUpperCase();
      if(rules[name]) {
        rules[name]["style"][property] = value;
        return true;
      }
      else {
        for(var sheet = document.styleSheets.length; sheet >=0; sheet--) {
        	var theRules = new Array();
        	if(typeof document.styleSheets[sheet] == "object") {
          	if(document.styleSheets[sheet].cssRules)
          		theRules = document.styleSheets[sheet].cssRules
          	else if (document.styleSheets[sheet].rules)
          		theRules = document.styleSheets[sheet].rules
          	else return false;
          	for(var index = 0; index < theRules.length; index++) {
              if((theRules[index].cssText && theRules[index].cssText.toUpperCase().substr(0,(function(){
                return theRules[index].cssText.indexOf("{");
              })()).indexOf(name) >= 0)
              || (theRules[index].selectorText && theRules[index].selectorText.toUpperCase().indexOf(name) >= 0)) {
                theRules[index].style[property] = value;
                rules[name] = {
                  "style" : theRules[index].style,
                  "index" : index,
                  "sheet" : 0
                };
                return true;
              }
            }
          }
        }
        return false;
      }
    },function(name,property) {
      if (!document.styleSheets) return false;
      name = name.toUpperCase();
      if(rules[name]) {
        if(document.styleSheets[sheet].deleteRule) {
          document.styleSheets[rules[name]["sheet"]].deleteRule(rules[name]["index"]);
          return true;
        } else return false;
      }
      else {
        for(var sheet = document.styleSheets.length; sheet >=0; sheet--) {
          var theRules = new Array();
          if(typeof document.styleSheets[sheet] == "object") {
          	if (document.styleSheets[sheet].cssRules)
          		theRules = document.styleSheets[sheet].cssRules
          	else if (document.styleSheets[sheet].rules)
          		theRules = document.styleSheets[sheet].rules
          	else return false;
          	for(var index = 0; index < theRules.length; index++) {
              if((theRules[index].cssText && theRules[index].cssText.toUpperCase().substr(0,(function(){
                return theRules[index].cssText.indexOf("{");
              })()).indexOf(name) >= 0)
              || (theRules[index].selectorText && theRules[index].selectorText.toUpperCase().indexOf(name) >= 0)) {
                rules[name] = {
                  "style" : theRules[index].style,
                  "index" : index,
                  "sheet" : sheet
                };
                if(document.styleSheets[sheet].deleteRule) {
                  document.styleSheets[sheet].deleteRule(index);
                  return true;
                } else return false;
              }
            }
          }
        }
        return false;
      }
  },function(name,property) {
      if (!document.styleSheets) return false;
      name = name.toUpperCase();
      if(rules[name]) {
        if(document.styleSheets[sheet].deleteRule) {
          document.styleSheets[rules[name]["sheet"]].addRule(name,property);
          return true;
        } else return false;
      }
      else {
        for(var sheet = document.styleSheets.length; sheet >=0; sheet--) {
          var theRules = new Array();
          if(typeof document.styleSheets[sheet] == "object") {
          	if (document.styleSheets[sheet].cssRules)
          		theRules = document.styleSheets[sheet].cssRules
          	else if (document.styleSheets[sheet].rules)
          		theRules = document.styleSheets[sheet].rules
          	else return false;
          	for(var index = 0; index < theRules.length; index++) {
              if((theRules[index].cssText && theRules[index].cssText.toUpperCase().substr(0,(function(){
                return theRules[index].cssText.indexOf("{");
              })()).indexOf(name) >= 0)
              || (theRules[index].selectorText && theRules[index].selectorText.toUpperCase().indexOf(name) >= 0)) {
                rules[name] = {
                  "style" : theRules[index].style,
                  "index" : index,
                  "sheet" : sheet
                };
                if(document.styleSheets[sheet].addRule) {
                  document.styleSheets[sheet].addRule(name,property);
                  return true;
                } else return false;
              }
            }
          }
        }
        return false;
      }
    }]
  }
)();
var changeCSSRule = addCSSRule[0];
var removeCSSRule = addCSSRule[1];
addCSSRule = addCSSRule[2];
*/