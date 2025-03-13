var Ego,
    canvas,
    veilColor, veilOpacity=40,
    originalGridColor,
    originalBackgroundColor,
    originalCellColor,
    gridColors,
    textColors,
    speedColors,
    sTextColors,
    foodColors,
    scoreColors,
    scoreColorTresholds = [],
    positionsCache,
    drawTextMultiplier,    // Declares how much bigger than "length" the drawn texts will be
    drawTextFactor = 0.75, // Declares how much the drawTextMultiplier matters
    centerDrawHidingDelay = 1000,
    GlowTextHidingDelay = 1000,
    SpeedsCarouselVelocity = 80, // Declares how many milliseconds a speed will stay shown before the next rotation
    centerGrowDrawQueue = [],
    centerGlowEngaged = false,
    centerGlowDisabled = {
      queue: [],
      enable: function() {
        centerGrowDrawQueue = centerGrowDrawQueue.concat(this.queue);
        this.queue.length = 0;
        this.disabled = false;
        if(centerGrowDrawQueue.length) {
          centerGrowDraw.apply(this, centerGrowDrawQueue[0]);
          centerGrowDrawQueue.shift();
        }
      },
      disabled: false
    },
    Html = document.documentElement || document.getElementsByTagName("html")[0],
    Head, Body,
    SVGSupport = document.implementation.hasFeature(
      "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"
    ) && (function() {
        var dataURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzUiIGhlaWdodD0iMjc1Ij48L3N2Zz4%3D',
            img = document.createElement('img');
        img.src = dataURI;
        return img.complete || !(img.onload = function() {
          SVGSupport = true;
        });
    })(),
    CSSFilters    = "filters"          in Html,
    CSSTransform  = "transform"        in Html.style ||
                    "WebkitTransform"  in Html.style ||
                    "MozTransform"     in Html.style ||
                    "OTransform"       in Html.style,
    CSSOpacity    = "opacity"          in Html.style,
    CSSGlow       = "textShadow"       in Html.style,
    textContent   = "innerText" in document.createElement("span")?"innerText":"textContent",
    field, fieldElement,
    width, height,
    minLarger = 30, // The minimal width / height of the game field in cells
    minSmaller = 20, // The minimal height / width of the game field in cells
    minWidth,
    minHeight,
    scoreCalcAvg = 27.5, // Speed constant, originally minWidth / minHeight, now [30, 25].avg()
    paused = false,
    silentPaused = false,
    presetLength = 40, // The default length of one cell in square pixels
    length,
    defaultLength = 2, // The default snake length minus head
    maxEaten = minLarger * minSmaller - defaultLength - 1,
    maxScore,
    starsSpans = [], starsAnim = [], stars = [],
    starsImage,
    starsNumber = 3, // The number of stars which float above the dazed snake's head
    reactionTime = 580, // In milliseconds, added to the time you have to catch the bonusFood
    superFoodChance = [ // The numbers are in the 1 / x format
      [         // Helper 10
        100, // When the field is empty
        40   // When the field is full
      ],
      [         // Scaling 0
        10,  // When the field is empty
        4    // When the field is full
      ],
      [         // Skill 10
        4,   // When the field is empty
        2.5  // When the field is full
      ],
      function() { // The getter
        var status = ScalingSystem.get(),
            _ = superFoodChance;
        if(status > 0) {
          status = (10 - status) / 10;
          return 1 / _[2][0] - (1 / _[2][0] - 1 / _[1][0]) * status + (
            (1 / _[2][1] - (1 / _[2][1] - 1 / _[1][1]) * status) -
            (1 / _[2][0] - (1 / _[2][0] - 1 / _[1][0]) * status)
          ) * (Ego.length + 1) / (width * height);
        }
        if(status < 0) {
          status = (10 + status) / 10;
          return 1 / _[0][0] - (1 / _[0][0] - 1 / _[1][0]) * status + (
            (1 / _[0][1] - (1 / _[0][1] - 1 / _[1][1]) * status) -
            (1 / _[0][0] - (1 / _[0][0] - 1 / _[1][0]) * status)
          ) * (Ego.length + 1) / (width * height);
        }
        return 1 / _[1][0] + (1 / _[1][1] - 1 / _[1][0]) * (Ego.length + 1) / (width * height);
      }
    ],
    legendFoodChance = [ // The numbers are in the 1 / x format
      20,  // Skill 10: When the field is empty
      8,   //           When the field is full
      function() { // The getter
        var status = ScalingSystem.get(),
                 _ = legendFoodChance;
        return status < 5?0:
          1 / _[0] * (status - 5) / 5 + (
            1 / _[1] * (status - 5) / 5 -
            1 / _[0] * (status - 5) / 5
          ) * (Ego.length + 1) / (width * height);
      }
    ],
    scalingSystemVars = [
      1,    // Help:  Step upwards
      4,    //        Step downwards
      0.5,  // Skill: Step upwards
      2     //        Step downwards
    ],
    bonusFoodTolerance = [      // How many times longer than the shortest path you can search for the bonusFood before it vanishes
      1.3, // With Skill 10
      1.8, // With Scaling 0
      3.5, // With Helper 10
      function() { // The getter
        var status = ScalingSystem.get(),
            _ = bonusFoodTolerance;
        return status > 0?
          _[1] - (_[1] - _[0]) *  status / 10:(
               status < 0?
          _[1] + (_[2] - _[1]) * -status / 10:_[1]
          )
      }
    ],
    speedBonus = [
      1,   // The lowest speed  - 1x score
      5    // The highest speed - 5x score
    ],
    speedCoeff = [
      4,   // Speed: 1
      1,   // Speed: 10
      function() { // The getter
        var _ = speedCoeff;
        return _[0] - (_[0] - _[1]) * (speed - speeds[0]) / (speeds[2] - speeds[0])
      }
    ],
    speeds = [
      1,   // The lowest speed
      5,   // Te default speed
      10   // The highest speed
    ],
    spawnDelay = [ // Bonus food spawn delay in milliseconds
      5000,  // Randomness: from
      10000, //             to
      0,     // Fulness: 0%
      2000,  //          100%
      0.45   // Skill: 10
    ],
    modeSwitchLength = 5000,    // The length of the Dusk / Dawn switch in milliseconds
    glowLengthRoot = 12,        // The root from which the achievement glow effects are calculated
    scoreRoot = 13,             // The root from which the score is calculated
    bonusFoodSpawned = null,    // A pointer to the gameField cell object of the spawned bonusFood
    regularFoodSpawned = {      // Coordinates of the spawned regular fodder
      position: [],
      legendary: false
    },
    bonusFoodSpawnMoves,        // The number of moves to the next bonusFood spawn since the last one
    movesCounter = 0,           // The number of moves you've made since the last bonusFood spawn
    foodEatenAnim = false,
    foodEatenAnimDisabled = false,
    speedBoost = [
      1, // Current speed boost
      0, // Speed boost decelaration per step
      0, // Time you've been waiting so far -
           // 0 or currInterval / speedBoost[0] - currInterval
      1, // Current effectiveness of the boost
    ],
    interval = 0, first = true, // First game true / false - Doèasné, nemìlo by být potøeba, hack!
    maxInterval = calcInterval(speeds[2]), currInterval,
    fieldClass = "nic", // CSS classes definition
    food = "jidlo",
    bonusFood = "bonusJidlo",
    superFood = "superJidlo",
    legendFood = "legendJidlo",
    body = "telo",
    head = "hlava",
    eatenLegendFood = false,
    lengthMultiplier = 1, // The bigger field the more cells you get per food
    foodGlowLength = (function() {
      var o = {};
          o[food] = 6;
          o[bonusFood] = 10;
          o[superFood] = 15;
          o[legendFood] = 25;
      return o;
    })(),
    foodSTextColors = (function() {
      var o = {};
          o[food] = 0;
          o[bonusFood] = 1;
          o[superFood] = 2;
          o[legendFood] = 3;
      return o;
    })(),
    foodGridColors = (function() {
      var o = {};
          o[food] = 0;
          o[bonusFood] = 1;
          o[superFood] = 5;
          o[legendFood] = 6;
      return o;
    })(),
    foodColorIndexes = (function() {
      var o = {};
          o[food] = 3;
          o[bonusFood] = 2;
          o[superFood] = 1;
          o[legendFood] = 0;
      return o;
    })(),
    foodScoreTextSize = (function() {
      var o = {};
          o[food] = 1;
          o[bonusFood] = 1.3;
          o[superFood] = 1.8;
          o[legendFood] = 2.6;
      return o;
    })(),
    foodScoreTextHideDelay = (function() {
      var o = {};
          o[food] = 0;
          o[bonusFood] = 500;
          o[superFood] = 1000;
          o[legendFood] = 2000;
      return o;
    })(),
    foodBonuses = (function() {
      var o = {};
          o[food] = 1;         // Regular Food: 1x multiplier
          o[bonusFood]  = 3;   // Bonus Food: 3x multiplier
          o[superFood]  = 5;   // Super Food: 5x multiplier
          o[legendFood] = 15;  // Legendary Food: 15x multiplier
      return o;
    })(),
    foodBoosts = (function() {
      var o = {};
          o[food] =       [2,   0.5];     // Regular Food: 2x boost, 1/2 of the field
          o[bonusFood] =  [2.5, 3/4];     // Bonus Food: 2.5x boost, 4/3 of the field
          o[superFood] =  [3.5, 1  ];     // Super Food: 3.5x boost, the entire field
          o[legendFood] = [4,   4/3];     // Legendary Food: 4x boost, four thirds of the field
      return o;
    })(),
    LEFT = 0,           // Direction flags
    UP = 1,
    RIGHT = 2,
    DOWN = 3,
    PAUSE = 4,          // More listeningManager flags, call with listeningManager.listener(flag)
    SILENTPAUSE = 5,
    collisionList = [
      body,             // A list of all CSS collision classes
      head
    ],
    speed = storage?+storage.getItem("speed") || speeds[1]:speeds[1],
    performMove,
    DayTimeListener,
    listeningManager = {
      listener: function(result) {
        if(result < 4 && (!paused || silentPaused)) Buffer.hit(result);
        else if((result === PAUSE && !switchingModes) || result === SILENTPAUSE) {
          if(!paused) {
            if(result === PAUSE) {
              // Doèasné
              Cursor.Show();
              Pause.show();
            }
            paused = true;
            if(result === SILENTPAUSE) silentPaused = true;
            (speedBoost[0] === 1 && speedBoost[1] === 0?clearInterval:clearTimeout)(interval);
          } else {
            // Doèasné
            Cursor.Hide();
            paused = false;
            if(result === SILENTPAUSE) silentPaused = false;
            else Pause.hide();
            interval = (speedBoost[0] === 1 && speedBoost[1] === 0?setInterval:setTimeout)(performMove, currInterval / speedBoost[0], currInterval);
          }
        }
      },
      listening: false,
      listen: function() {
        if(!this.listening) {
          listener.startListening();
          this.listening = true;
        }
      },
      stopListening: function() {
        if(this.listening) {
          listener.stopListening();
          this.listening = false;
        }
      }
    },
    listener = new Listener(
      [left,up,right,down,pause],
      false,
      listeningManager.listener
    ),
    tableStyle,         // A reference to the declared style element
    switchingModes = false, // Is / isn't a mode switch in process
    eaten = 0,
    score = 0;

Screen.onload = function() {
  Head = document.head || document.getElementsByTagName("head")[0];
  Body = document.body || document.getElementsByTagName("body")[0];
  canvas = document.getElementById("canvas");
  game(true);
};

function reset() {
  var calcDimensions = function() {
    width  = Math.floor((Screen.clientDimensions[0] - 1) / (length + 1));
    height = Math.floor((Screen.clientDimensions[1] - 1) / (length + 1));
  }, squareRescale = function() {
    length = Math.min(
      -(minWidth  - Screen.clientDimensions[0] + 1) / minWidth,
      -(minHeight - Screen.clientDimensions[1] + 1) / minHeight
    ).floor();
  }, applyCSS = function() {
    var append, rules;
    if(tableStyle === undefined) {
      append = true;
      tableStyle = document.createElement("style");
      tableStyle.setAttribute("type", "text/css");
    } else {
      while(tableStyle.hasChildNodes()) {
        tableStyle.removeChild(tableStyle.firstChild);
      }
    }
    rules = document.createTextNode(".gameField td{width:" + length + "px;height:" + length + "px;}");
    if(tableStyle.styleSheet)
      tableStyle.styleSheet.cssText = rules.nodeValue;
    else
      tableStyle.appendChild(rules);
    if(append === true)
      Head.appendChild(tableStyle);
  };
  minWidth  = Screen.clientDimensions[0] > Screen.clientDimensions[1]?minLarger:minSmaller;
  minHeight = Screen.clientDimensions[1] > Screen.clientDimensions[0]?minLarger:minSmaller;
  length = presetLength;
  squareRescale();
  calcDimensions();
  applyCSS();
  drawTextMultiplier = (Math.abs(width - height) / Math.min(width, height)) * drawTextFactor + 1;
  lengthMultiplier = (width * height - defaultLength - 1) / (maxEaten);
  speedBoost[3] = 1 - (defaultLength + 1) / (0.75 * width * height);
  field = new gameField(width, height, fieldClass, collisionList, lifeTimeManager);
  if(fieldElement) canvas.removeChild(fieldElement);
  fieldElement = field.toHTML();
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
};

function clear() {
  paused = false;
  movesCounter = 0;
  bonusFoodSpawned = null;
  eatenLegendFood = false;
  AchievementBonusFoodCollect = [0,0];
  AchievementSuperFoodCollect = [0,0];
  FirstCombo = true;
  AchievementsListener.detach();
  centerGrowDrawQueue.length = 0;
  scoreColorTresholds.length = 0;
  score = 0;
  eaten = 0;
  field.clear();
  field.movement.clearCallbacks();
  field.lifeTimeManager.clear();
  (speedBoost[0] === 1 && speedBoost[1] === 0?
    clearInterval:clearTimeout)(interval);
  listeningManager.stopListening();
  Buffer.unregister();
  ScalingSystem.reset();
  speedBoost[0] = 1;
  speedBoost[1] = speedBoost[2] = 0;
  if(Ego.alive) Ego.destroy(true);
  if(stars.length) undrawAllStars();
};

function game(resetField) {
  performMove = function(repeated) {
    if(  speedBoost[0] === 1) {
      if(speedBoost[1] !== 0) {
         speedBoost[1]   = 0;
        interval = setInterval(performMove, currInterval);
      }
    } else {
      interval = setTimeout(performMove, currInterval / speedBoost[0], currInterval);
      if(  speedBoost[0] >  1 + speedBoost[1])
           speedBoost[0] -=     speedBoost[1];
      else speedBoost[0]  = 1;
    } field.movement.perform();
  };

  function showMenu() {
    focus(); Menu.show(undefined, {
      showScore: !first,
      callback: function() {
        if(first) first = false;
        else clear();

        maxScore = calcScore(maxEaten);
        PrepareAchievements(speed, ScoreAchievements, DynamicAchievementsList);
        AchievementsListener.attach(StaticAchievementsList);
        AchievementsListener.attach(DynamicAchievementsList);
        currInterval = calcInterval();
        spawn(food);

        Ego = new Snake(field, {
          head: head,
          body: body,
          length: defaultLength,
          automation: {
            movement: {
              lifeTimeManager: field.lifeTimeManager,
              pursue: {
                point: [
                  function() {
                    return regularFoodSpawned.legendary === true?
                           regularFoodSpawned.position:false;
                  },
                  function() {
                    return bonusFoodSpawned !== null?
                           bonusFoodSpawned.position:false;
                  },
                  function() {
                    return regularFoodSpawned.position;
                  },
                  function() {
                    return this.length === this._.length?this.history[this.history.length - 2]:this.lastCell;
                  }
                ],
                method: NONE
              }
            },
            autoSpawn: true,
            drawStars: true
          },
          collision: {
            walls: TRANSIT,
            body: true,
            items: true
          },
          callbacks: {
            death: function() {
              if(speedBoost[0] === 1 ||
                (speedBoost[0] > 1 && speedBoost[2] === currInterval)) {
                (speedBoost[0] === 1 && speedBoost[1] === 0?clearInterval:clearTimeout)(interval);
                centerGrowDrawQueue.length = 0;
                listeningManager.stopListening();
                Buffer.unregister();
                paused = true;
                // Doèasné
                Cursor.Show();
                // AchievementsListener.check("death"); - Not needed atm
              } else {
                if(speedBoost[2] + currInterval / speedBoost[0] >= currInterval) {
                  speedBoost[2] = currInterval;
                  clearTimeout(interval);
                  setTimeout(performMove, currInterval - speedBoost[2], currInterval);
                } else {
                  speedBoost[2] += currInterval / speedBoost[0];
                }
                // For testing purposes only
                // console.log("CurrInterval: " + currInterval + ", SpeedBoostedCurrInterval: " + currInterval / speedBoost[0] + ", CurrentOffset: " + speedBoost[2]);
                return false;
              }
            },
            tailMiss: function() {
              AchievementsListener.check("tailMiss");
            },
            afterDeath: game,
            collision: function(x, y, get) {
              var currBoost = speedBoost[0],
                  currBoostReductionPerMove = speedBoost[1],
                  currNumOfBoostedMoves = currBoostReductionPerMove?
                    Math.floor((currBoost - 1) / currBoostReductionPerMove):0,
                  newBoost,
                  newBoostReductionPerMove,
                  newNumOfBoostedMoves;
              switch(get) {
                case food:
                case superFood:
                case bonusFood:
                case legendFood:
                  FullscreenGlow(currInterval * foodGlowLength[get], gridColors[foodGridColors[get]], foodGridColors[get]);
                  score = calcScore(eaten += foodBonuses[get]);
                  this.length = defaultLength + Math.round(eaten * lengthMultiplier);
                  if(get !== food)
                    ScalingSystem.set(SKILL);
                  AchievementsListener.check(get);
                  if(get === legendFood) {
                    eatenLegendFood = true;
                    regularFoodSpawned.remove();
                  } else if(get === bonusFood || get === superFood) {
                    bonusFoodSpawned.remove();
                    bonusFoodSpawnMoves = calcBonusFoodSpawn(this.length + 1);
                  } else {
                    if(!bonusFoodSpawned && bonusFoodSpawnMoves - movesCounter >= 3000 / currInterval)
                      movesCounter += Math.round(1000 / currInterval);
                    // Mínus 1000 ms v tazích èekání na bonus pøi snìdení normálního jídla, 3 sekundy se vždy ponechají
                  }
                  snakeDraw([x,y], foodScoreTextHideDelay[get], sTextColors[foodSTextColors[get]], "score", (score >= 1000?0.9:1) * foodScoreTextSize[get], score >= 1000?score.group():score);
                  field.remove(x,y);
                  this.move(false);
                  if(get === legendFood)
                    regularFoodSpawned.legendary = false;
                  if(get === food || get === legendFood)
                    spawn(food);
                  if(speedBoost[3]) {
                    (speedBoost[0] === 1 && speedBoost[1] === 0?clearInterval:clearTimeout)(interval);
                    newBoost = foodBoosts[get][0] * speedBoost[3];
                    newBoostReductionPerMove = (foodBoosts[get][0] - 1) / (Math.avg(width, height) * foodBoosts[get][1])
                    newNumOfBoostedMoves = Math.floor((newBoost - 1) / newBoostReductionPerMove);
                    if(newBoost > currBoost)
                      speedBoost[0] = newBoost;
                    if(newNumOfBoostedMoves >= currNumOfBoostedMoves)
                      speedBoost[1] = newBoostReductionPerMove;
                    else
                      speedBoost[1] = ((newBoost > currBoost?newBoost:currBoost) - 1) / currNumOfBoostedMoves;
                    interval = setTimeout(performMove, currInterval / speedBoost[0], currInterval);
                  }
              }
              AchievementsListener.check(eaten);
            },
            directionChange: function() {
              AchievementsListener.check("changeDirection");
            },
            lengthChange: function(length) {
              if(speedBoost[3] !== 0) {
                speedBoost[3] = 1 - (this.length + 1) / (0.75 * width * height);
                if(speedBoost[3] < 0) speedBoost[3] = 0;
              }
            },
            move: function() {
              //AchievementsListener.check("move"); - Not needed atm
              if(speedBoost[2] !== 0) speedBoost[2] = 0;
              // For testing purposes only, displays the remaining turns to the de/spawning of the bonus food
              // if(bonusFoodSpawned) snakeDraw(Ego.position,0,sTextColors[bonusFoodSpawned.extra?2:1],"score",0.6,bonusFoodSpawned.lifetime - movesCounter === Infinity?"Anim":bonusFoodSpawned.lifetime - movesCounter);
              // else snakeDraw(Ego.position,0,sTextColors[0],"score",0.6,bonusFoodSpawnMoves - movesCounter);
              if(bonusFoodSpawned && movesCounter >= bonusFoodSpawned.lifetime) {
                bonusFoodSpawned.lifetime = Infinity;
                if(bonusFoodSpawned.extra) {
                  bonusFoodSpawned.warp();
                } else {
                  bonusFoodSpawned.despawn();
                }
              }
              if(!bonusFoodSpawned && movesCounter >= bonusFoodSpawnMoves) {
                spawn(toss(superFoodChance[3]())?superFood:bonusFood);
                // For testing purposes only
                // console.log("Epic food spawn chance: " + (100 * superFoodChance[3]()) + "%");
              }
            }
          },
          position: [Math.round((width-1)/2), Math.round((height-1)/2)],
          direction: Math.round(Math.random()*3)
        });
        field.movement.addCallback(function(){
          movesCounter++;
        });
        Cursor.Hide();
        bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
        interval = setInterval(performMove, currInterval);
        Buffer.register(Ego);
        listeningManager.listen();
      }
    });
  }

  if(resetField) reset();
  if(first) {
    function noGeolocation() {
      if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        Night.Apply();
      } else {
        Day.Apply();
      }
    }
    if(navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(function(position) {
        DayTimeListener = new DayTime(position.coords.latitude,
                                      position.coords.longitude);
       (DayTimeListener.now === DayTime.DAY?Day:Night).Apply();
        DayTimeListener.listen(modeSwitch);
        GUIInit();
        showMenu();
      }, function() {
        noGeolocation();
        GUIInit();
        showMenu();
      }, {
        enableHighAccuracy: false,
        timeout: Infinity,
        maximumAge: Infinity,
      });
    } else {
      noGeolocation();
      GUIInit();
      showMenu();
    }
  } else {
    showMenu();
  }
};

function gameField(width, height, fieldClass, collisionList, manager) {
  var field = [],
      Objectfield = [],
      HTMLfield = [],
      lifeTimeManager = this.lifeTimeManager = new manager();
  this.collisionList = collisionList;
  this.isFull = false;
  this.toHTML = function() {
    var table = document.createElement("table"),
        tbody = document.createElement("tbody"),
        tr, td;
        table.className = "gameField";
    for(var count = 0; count < height; count++) {
      tr = document.createElement("tr");
      for(var count2 = 0; count2 < width; count2++) {
        td = document.createElement("td");
        if(field[count] && field[count][count2]) td.className = field[count][count2];
        else td.className = fieldClass;
        tr.appendChild(td);
        if(!HTMLfield[count2]) HTMLfield[count2] = [];
        HTMLfield[count2][count] = td;
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
  };
  this.spawn = function(x, y, what, lifeTime) {
    if(Number.isNumber(lifeTime))
      lifeTimeManager.set(x, y, lifeTime);
    else if((this.collisionList.indexOf(what) > -1 &&
            (!field[x] || !this.collisionList.indexOf(field[x][y])))) {
      if(!Number.isNumber(lifeTime))
        return;
      else lifeTimeManager.set(x, y, lifeTime);
    }
    var changes = !(field[x] && field[x][y]);
    if(!field[x]) field[x] = [];
    field[x][y] = what;
    if(HTMLfield[x] && HTMLfield[x][y]) HTMLfield[x][y].className = what;
    if(changes && this.getFree().length === 0 && !this.isFull) this.isFull = true;
  };
  this.copy = function(x, y, x2, y2, lifeTime) {
    if(Number.isNumber(lifeTime))
      lifeTimeManager.set(x2, y2, lifeTime);
    else if((this.collisionList.indexOf(what) > -1 &&
            (!field[x] || !this.collisionList.indexOf(field[x][y])))) {
      if(!Number.isNumber(lifeTime))
        return;
      else lifeTimeManager.set(x2, y2, lifeTime);
    }
    var changes = !(field[x2] && field[x2][y2]);
    if(!field[x]) field[x] = [];
    if(!field[x2]) field[x2] = [];
    field[x2][y2] = field[x][y];
    if(HTMLfield[x2] && HTMLfield[x2][y2]) HTMLfield[x2][y2].className = field[x][y];
    if(changes && this.getFree().length === 0 && !this.isFull) this.isFull = true;
  };
  this.move = function(x, y, x2, y2, lifeTime) {
    if(!Number.isNumber(lifeTime)) {
      lifeTimeManager.remove(x, y, lifeTime);
      lifeTimeManager.set(x2, y2, lifeTime);
    }
    else if((this.collisionList.indexOf(what) > -1 &&
            (!field[x] || !this.collisionList.indexOf(field[x][y])))) {
      if(!Number.isNumber(lifeTime))
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
  };
  this.remove = function(x, y) {
    if(!field[x]) field[x] = [];
    if(this.isFull) this.isFull = false;
    field[x][y] = null;
    if(HTMLfield[x] && HTMLfield[x][y]) HTMLfield[x][y].className = fieldClass;
    lifeTimeManager.remove(x, y);
  };
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
  };
  this.get = function(x,y) {
    return field[x] && field[x][y]?field[x][y]:false;
  };
  this.getElement = function(x,y) {
    return HTMLfield[x] && HTMLfield[x][y]?HTMLfield[x][y]:false;
  };
  this.getObject = function(x,y) {
    if(!Objectfield[x]) Objectfield[x] = [];
    if(!Objectfield[x][y]) Objectfield[x][y] = {};
    return Objectfield[x][y];
  };
  this.clearObject = function(x,y) {
    if(!Objectfield[x] || !Objectfield[x][y]) return false;
    for(var z in Objectfield[x][y]) {
      delete Objectfield[x][y][z];
    }
    return true;
  };
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
  };
  this.getPos = function(x,y) {
    if(!HTMLfield[x] || !HTMLfield[x][y]) return false;
    var pos = getPos(HTMLfield[x][y]);
    pos[1] += (HTMLfield[x][y].offsetHeight - length) - HTMLfield[x][y].offsetHeight / 2;
    return pos;
  };

  var callbacks = [],
      FCCallbacks = [];
  this.movement = {
    addCallback: function(obj) {
      callbacks.push(obj);
    },
    addFCCallback: function(obj) {
      FCCallbacks.push(obj);
    },
    removeCallback: function(obj) {
      var index = callbacks.indexOf(obj);
      if(index !== -1) callbacks.remove(index);
    },
    removeFCCallback: function(obj) {
      var index = FCCallbacks.indexOf(obj);
      if(index !== -1)
        FCCallbacks.remove(index);
    },
    clearCallbacks: function() {
      callbacks.length = 0;
    },
    perform: function() {
      FCCallbacks.forEach(function(obj) {
        if(!obj) return false;
        else if(obj instanceof Function) obj();
        else obj.callback.call(obj.context);
      });
      lifeTimeManager.decrease();
      callbacks.forEach(function(obj) {
        if(!obj) return false;
        else if(obj instanceof Function) obj();
        else obj.callback.call(obj.context);
      });
    }
  };
};

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
    if(!container[x] || !Number.isNumber(container[x][y]))
      return 0;
    return container[x][y];
  }

  this.getArray = function(x, y) {
    var New = [];
    container.forEach(function(e){
      New.push(e.slice(0));
    });
    return New;
  }

  this.set = function(x, y, value) {
    if(!container[x] || !Number.isNumber(container[x][y]) || container[x][y] >= value)
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
    if(!container[x] || !Number.isNumber(container[x][y]))
      return;
    if(container[x][y])
      container[x][y] = 0;
  }
};

lifeTimeManager.globalDecrease = function() {
  if(!this.array) return;
  this.array.forEach(function(field) {
    field.decrease();
  });
};

lifeTimeManager.globalClear = function() {
  if(!this.array) return;
  this.array.forEach(function(field) {
    field.clear();
  });
};

lifeTimeManager.globalRemove = function(x, y) {
  if(!this.array) return;
  this.array.forEach(function(field) {
    field.remove(x, y);
  });
};

lifeTimeManager.globalDestroy = function() {
  if(!this.array) return;
  this.array.length = 0;
};

function PrepareAchievements(speed, data, outputArray) {
  // Parse and consolidate the Dynamic Data
  var result = [], adopt = [], dynamicAmount = 0, dynamicIndex = 1;
  data.forEach(function(data) {
    var index = 0;
    if(data.text instanceof Array) {
      for(index = data.text[1]; index <= data.text[2]; index++) {
        dynamicAmount++;
        result.push({
          text: data.text[0][index],
          colors: data.colors,
          sizeMultiplier: data.sizeMultiplier,
          delay: data.delay,
          score: "$",
          first: index === data.text[1]
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
                 findScore(data.treshold.amount):
                 data.treshold.amount):"$$"
        });
    }
  });

  result.forEach(function(result, index, that) {
    if(result.score === "$") {
      result.score = dynamicIndex++ * maxEaten / dynamicAmount;
      if(result.first) scoreColorTresholds.push(calcScore(result.score));
    } else if(result.score === "$$") {
      result.score = dynamicIndex++ * maxEaten / dynamicAmount;
      adopt.push(result);
      that.remove(index);
    }
  });

  adopt.forEach(function(adopt) {
    var offsetArray = [];
    result.forEach(function(result) {
      if(Number.isNumber(result.score))
        offsetArray.push(Math.abs(result.score - adopt.score));
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

  // Create an array of objects fit for the Achievements class
  if(outputArray.length > 0) outputArray.length = 0;
  result.forEach(function(field) {
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
          textColors[field.colors],
          length / 2,
          length * field.sizeMultiplier,
          field.text
        );
        FullscreenGlow(
          currInterval * glowLengthRoot * field.delay / 2000,
          gridColors[field.colors + (field.colors === 3?2:1)],
                     field.colors + (field.colors === 3?2:1)
        );
      }
    });
  });
};

function modeSwitch(mode) {
  if(switchingModes) return;
  if(Graphics.ModeSwitchAnimation === false)
    return (mode === DayTime.DUSK?Night:Day).Apply();
  var count = 0, counter = function() {
        if(++count === 3) mSwitch();
      }, mSwitch = function() {
        Skin.Transition(
          mode === DayTime.DAWN?Night:Day,
          mode === DayTime.DUSK?Night:Day,
          modeSwitchLength,
          function() {
            foodEatenAnimDisabled = false;
            centerGlowDisabled.enable();
            if(keyListenerListening) {
              if(silentPaused)
                listeningManager.listener(SILENTPAUSE);
              listeningManager.listen();
            }
            openGUIs.forEach(function(GUI) {
              GUI.show();
            });
            focus();
            switchingModes = false;
          }
        );
      }, openGUIs = [], openGUIsLength,
      keyListenerListening = listeningManager.listening;

  switchingModes = true;
  GUI.instances.forEach(function(GUInst) {
    if(GUInst.status !== GUI.HIDDEN)
       openGUIs.push(GUInst);
  });
  openGUIsLength = openGUIs.length;

  if(keyListenerListening) {
    if(!paused)
      listeningManager.listener(SILENTPAUSE);
    Buffer.clear();
  }

  (mode === DayTime.DAWN?Day:Night).ApplyTextVariables();
  foodEatenAnimDisabled = true;
  centerGlowDisabled.disabled = true;

  if(openGUIsLength) GUI.hide(counter);
  else count++;

  if(centerGlowEngaged)
    centerGrowDrawQueue.callback = counter;
  else count++;

  if(foodEatenAnim)
    foodEatenAnim.callback = counter;
  else count++;

  if(count === 3) mSwitch();
};

/*function changeSpeed(newSpeed) {
  if(newSpeed === speed) return;
  var setBoost = false;
  if(speedBoost[0] !== 1 || speedBoost[1] !== 0) {
    setBoost = true;
    speedBoost[0] = 1;
    speedBoost[1] = 0;
    clearTimeout(interval);
  } else {
    clearInterval(interval);
  }
  speed = newSpeed;
  currInterval = calcInterval();
  if(setBoost) interval = setTimeout (performMove, currInterval / speedBoost[0], currInterval);
  else         interval = setInterval(performMove, currInterval);
};*/

function calcInterval(passedSpeed) { /* Obsolete and rather hacky code
  return Math.round(((800 - ((9-(speed-1))*(800/10))) * ((Math.min(width,height)-Math.min(minHeight,minWidth)>0?Math.min(width,height)-Math.min(minHeight,minWidth):0) / 20) // Zpomalení pro vìtší hrací pole, Math.min(minHeight,minWidth) políèek: 0 sekund, pak 800 - 800/6 (10 - 1 speed) ms po 20 políèkách
    + (11 - speed) * 1000) / ((width+height) / 2)); // 8 sekund na pøejetí prùmìru kratší a delší strany pøi nejpomalejším módu, 1 pøi nejrychlejším
  */
  return (6000 - ((passedSpeed || speed) - 1) * (5000 / (speeds[2] - speeds[0]))) / scoreCalcAvg;
  // 6 sekund na pøejetí prùmìru kratší a delší strany pøi nejpomalejším módu, 1 sekunda pøi nejrychlejším
  // Nepoužíváme skuteènou velikost stìn, ale konstantní prùmìr 27.5, vychází z velikostí stìn 30 a 25 a tyto rychlosti se osvìdèily
};

/*

  a = (l + (b - k) * (i - l) / j) * (m + c / (d * e - f - m) * h) * c * g
  c = -((e * d - f - m) * (-j * Math.sqrt(g.pow() * m.pow() * (((b - k) * (i - l)) / j + l).pow() + (4 * a * g * h * (((b - k) * (i - l)) / j + l)) / (e * d - f - m)) + b * g * m * i + g * j * l * m + g * k * l * m - b * g * l * m - g * k * m * i)) / (2 * g * h * (b * i - k * i + j * l + k * l - b * l))

  a = score
  b = speed
  c = eaten
  d = minWidth
  e = minHeight
  f = defaultLength
  g = scoreRoot
  h = 2
  i = speedBonus[1]
  j = (speeds[1] - speeds[0])
  k = 1
  l = speedBonus[0]
  m = 1

*/

function calcScore(eaten) {
  if(eaten > maxEaten)
    eaten = maxEaten;

  return Math.floor((speedBonus[0] + (speed - 1) * (speedBonus[1] - speedBonus[0])/(speeds[2] - speeds[0])) *      // za rychlost *
                    (1 + eaten / (maxEaten) * 2) *                                 // za zaplnìní *
                     eaten * scoreRoot);                                                                           // koøen
};

function findScore(score) {
  var a = score,
      b = speed,
      c = eaten,
      d = minWidth,
      e = minHeight,
      f = defaultLength,
      g = scoreRoot,
      h = 2,
      i = speedBonus[1],
      j = speeds[2] - speeds[0],
      k = 1,
      l = speedBonus[0],
      m = 1;
  return Math.ceil(-((e * d - f - m) * (-j * Math.sqrt(g.pow() * m.pow() * (((b - k) *
                  (i - l)) / j + l).pow() + (4 * a * g * h * (((b - k) * (i - l)) / j + l))
                  / (e * d - f - m)) + b * g * m * i + g * j * l * m + g * k * l * m - b *
                  g * l * m - g * k * m * i)) / (2 * g * h * (b * i - k * i + j * l + k * l - b * l)));
};

function calcDistance(location, target, collision) {
  var distX, distY;
  if(collision === false) {
    var middle = [],
        loc = location.slice(0),
        tar = target.slice(0);
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
    distX = Math.min(loc[0] + tar[0], Math.abs(location[0] - target[0]));
    distY = Math.min(loc[1] + tar[1], Math.abs(location[1] - target[1]));
  } else {
    distX = Math.abs(loc[0] - tar[0]);
    distY = Math.abs(loc[1] - tar[1]);
  }
  return distX + distY;
};

function calcBonusFoodSpawn(length) {
  return Math.round((
           (1 - ((1 - spawnDelay[4]) * ScalingSystem.get().abs() / 10)) *
           ((spawnDelay[0] + Math.random() * (spawnDelay[1] - spawnDelay[0])) +
           (spawnDelay[2] + (1 - length / maxEaten) * spawnDelay[3]))
         ) / maxInterval);
};

function FullscreenGlow(duration, color, importance) {
  if(!foodEatenAnimDisabled && Graphics.ChangingColor && Graphics.FullscreenEffects &&
    ((foodEatenAnim && (importance > foodEatenAnim.importance ||
      (importance === foodEatenAnim.importance && color === foodEatenAnim.color)))
      || !foodEatenAnim)) {
    var count = 0;
    if(foodEatenAnim) {
      foodEatenAnim.anim[0]();
      foodEatenAnim.anim[1]();
    }
    foodEatenAnim = {
      "importance": importance,
      "color": color,
      "anim": [
        recolor(duration, color[0], originalGridColor, function(color) {
          fieldElement.style.backgroundColor = color;
        }, function() {
          fieldElement.style.backgroundColor = "";
          count++;
          if(count === 2) {
            if(foodEatenAnim.callback instanceof Function)
              foodEatenAnim.callback();
            foodEatenAnim = false;
          }
        }),
        recolor(duration,color[1],originalBackgroundColor,function(color) {
          Body.style.backgroundColor = color;
        }, function() {
          Body.style.backgroundColor = "";
          count++;
          if(count === 2) {
            if(foodEatenAnim.callback instanceof Function)
              foodEatenAnim.callback();
            foodEatenAnim = false;
          }
        })
      ]
    }
  }
};

function drawStars(position) {
  position = positionsCache[position[0]][position[1]];
  var masterIndex = starsSpans.length;
  var innerElement = document.createElement("span");
  innerElement.style.position = "relative";
  innerElement.style.height = innerElement.style.width = length + "px";
  var eclipse = calculateEllipse(true, length / 2, length / 2, length / 2, length / 6, 0, Graphics.FramesPerSecond),
      index = [], last, node = new Image();
  node.src = starsImage[SVGSupport?1:0];
  node.style.width = node.style.height = (length/3) + "px";
  node.style.position = "absolute";
  for(var count = 1; count <= starsNumber; count++) {
    if(count === starsNumber) index.push(eclipse.length-1);
    else index.push(Math.round((eclipse.length-1)/starsNumber*count));
    last = stars.push(node.cloneNode(false)) - 1;
    stars[last].style.left = (eclipse[index[stars.length-1]][0] - (eclipse[index[stars.length-1]][0]/length)*length/3) + "px"; // Smrštìní se na velikost jednoho pole
    stars[last].style.top = eclipse[index[stars.length-1]][1] + (length/2) - (length/6) + "px";
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
  },1000 / Graphics.FramesPerSecond));
};

function undrawStars(index) {
  if(index > starsSpans.length-1) return false;
  clearInterval(starsAnim[index]);
  canvas.removeChild(starsSpans[index]);
  stars.splice(index,1);
  starsAnim.splice(index,1);
  return true;
};

function undrawAllStars() {
  if(starsSpans.length === 0) return false;
  starsSpans.forEach(function(span, index) {
    clearInterval(starsAnim[index]);
    canvas.removeChild(span);
    stars.splice(index, 3);
    starsAnim.splice(index, 3);
    starsSpans.splice(index, 1);
  });
  return true;
};

function snakeDraw(position,delay,colors,className,sizeMultiplier,text) {
  if(delay <= 0) delay = 1;
  var timeout = [],
      x = position[0],
      y = position[1],
      textColor = colors[0],
      shadowColor = colors[1];
  position = positionsCache[x][y];
  position = [(isNaN(Math.round(position[0]))?0:Math.round(position[0])), (isNaN(Math.round(position[1]))?0:Math.round(position[1]))];
  var score = document.createElement("div");
  score.className = className?"absolutePositionedText snakeDraw " + className:"absolutePositionedText snakeDraw";
  score.style.color = textColor;
  if(Graphics.TextGlowEffects && Graphics.TextGlowEffectsOnSnakeAndCenterText)
    setGlow(score,GlowMagnitude,shadowColor);
  score.style.height=(sizeMultiplier*length)+"px";
  score.style.fontSize=(sizeMultiplier*length)+"px";
  score.innerHTML = text;
  canvas.appendChild(score);
  if(Graphics.MovingObjects === true)
    timeout[0] = textMove(
      score,
      delay + 1000,
      position[0] + (length - score.offsetWidth) / 2,
      position[1] < (Graphics.TextGlowEffects === true?GlowMagnitude/2:0)?(Graphics.TextGlowEffects === true?GlowMagnitude/2:0):position[1],
      position[0] + (length - score.offsetWidth) / 2,
      position[1] + (Graphics.TextGlowEffects === true?GlowMagnitude/2:0) + 2*(position[1] + (Graphics.TextGlowEffects === true?GlowMagnitude/2:0) + 2*(-sizeMultiplier*length)<=0?sizeMultiplier*length:-sizeMultiplier*length),
      Graphics.TextGlowEffects === true?GlowMagnitude:false,
      true
    );
  else {
    score.style.left = (position[0] + score.offsetWidth + (Graphics.TextGlowEffects === true?GlowMagnitude/2:0) > Screen.clientDimensions[0]?
                          Screen.clientDimensions[0] - score.offsetWidth - (Graphics.TextGlowEffects === true?GlowMagnitude/2:0):
                       (position[0] + (length - score.offsetWidth) / 2 < (Graphics.TextGlowEffects === true?GlowMagnitude/2:0)?
                         (Graphics.TextGlowEffects === true?GlowMagnitude/2:0):
                          position[0] + (length - score.offsetWidth) / 2)) + "px";
    score.style.top = (position[1] + (Graphics.TextGlowEffects === true?GlowMagnitude/2:0) + 0.75 *
      (position[1] + (Graphics.TextGlowEffects === true?GlowMagnitude/2:0) + 0.75*(-sizeMultiplier*length)<=0?
         2 * length:
        -sizeMultiplier * length)) + "px";
  }
  if(Graphics.Transparency === true && Graphics.TransparencyOnSnakeText === true) {
    setTimeout(function(){timeout[1] = retransparent(score, 1000, 100, 0)}, delay);
  } else {
    setTimeout(function(){hide(score);},delay + 1000);
  }
  setTimeout(function(){if(timeout[0])timeout[0]();if(timeout[1])timeout[1]();hide(score);canvas.removeChild(score);},delay + 1000);
};

function centerGrowDraw(flightDelay,delay,colorArray,size,finalSize,text,inner) {
  var textColor = colorArray[0],
      finalTextColor = colorArray[1],
      shadowColor = colorArray[2],
      finalShadowColor = colorArray[3];
  if(centerGlowDisabled.disabled && !inner) {   // If it's disabled, we add the new stuff into the disabled queue
    centerGlowDisabled.queue.push([flightDelay,delay,colorArray,size,finalSize,text,true]);
    return;
  }
  if(centerGlowEngaged && !inner) {    // If it's engaged, we add the new stuff into the regular queue
    centerGrowDrawQueue.push([flightDelay,delay,colorArray,size,finalSize,text,true]);
    return;
  }
  centerGlowEngaged = true;
  size = size * drawTextMultiplier;
  finalSize = finalSize * drawTextMultiplier;
  if(delay <= 0) delay = 1;
  var score = document.createElement("div");
  score.className = "absolutePositionedText glowText";
  score.style.color = Graphics.ChangingColor === true?textColor:finalTextColor;
  score.style.fontSize=(Graphics.ResizingTexts === true?size:finalSize)+"px";
  score.innerHTML = text;
  if(Graphics.Transparency === true)
    setOpacity(score, 0);
  if(Graphics.TextGlowEffects === true)
    setGlow(score,GlowMagnitude,Graphics.ChangingColor === true?shadowColor:finalShadowColor);
  canvas.appendChild(score);
  if(Graphics.Transparency === true)
    retransparent(score,flightDelay/2,0,100);
  if(Graphics.ResizingTexts === true) {
    if(Graphics.RotatingObjects === true)
      rotate(score, flightDelay, 0, 360);
    textResize(score,flightDelay,size,finalSize,function() {
      score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
      score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
    }, function() {
      score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
      score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
      var sizeInterval = Graphics.ResizingTexts === true && Graphics.Transparency === true && Graphics.GlowTextHidingAndEnlarging === true?setTimeout(
        function() {
          sizeInterval = textResize(
            score,
            GlowTextHidingDelay,
            finalSize,
            (((Math.min(Screen.clientDimensions[0]/score.offsetWidth,Screen.clientDimensions[1]/score.offsetHeight)-1)*0.7)+1)>=2?2*finalSize:(((Math.min(Screen.clientDimensions[0]/score.offsetWidth,Screen.clientDimensions[1]/score.offsetHeight)-1)*0.7)+1)*finalSize,
            function() {
              score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
              score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
            }
          );
        },delay
      ):false;
      var colorInterval = Graphics.ChangingColor === true?[
        finalTextColor!=textColor?recolor(delay,textColor,finalTextColor,function(color){
          score.style.color = color;
        }, function(){
          colorInterval[0] = false;
        }):false,
        finalShadowColor!=shadowColor && Graphics.TextGlowEffects === true?recolor(delay,shadowColor,finalShadowColor,function(color){
          setGlow(score,GlowMagnitude,color);
        }, function(){
          colorInterval[1] = false;
        }):false
      ]:[false,false];
      if(Graphics.Transparency === true) {
        setTimeout(function(){
          retransparent(score, GlowTextHidingDelay, 100, 0,function(){
            if(sizeInterval) {
              if(sizeInterval instanceof Function) sizeInterval();
              else clearTimeout(sizeInterval);
            }
            if(colorInterval[0]) colorInterval[0]();
            if(colorInterval[1]) colorInterval[1]();
            hide(score);
            canvas.removeChild(score);
            if(centerGrowDrawQueue.length > 0) {
              centerGrowDraw.apply(this, centerGrowDrawQueue[0]);
              centerGrowDrawQueue.shift();
            } else {
              if(centerGrowDrawQueue.callback instanceof Function) {
                centerGrowDrawQueue.callback();
                centerGrowDrawQueue.callback = null;
              }
              centerGlowEngaged = false;
            }
          });
        }, delay);
      } else {
        setTimeout(function(){
          hide(score);
          if(sizeInterval) {
            if(sizeInterval instanceof Function) sizeInterval();
            else clearTimeout(sizeInterval);
          }
          if(colorInterval[0]) colorInterval[0]();
          if(colorInterval[1]) colorInterval[1]();
          hide(score);
          canvas.removeChild(score);
          if(centerGrowDrawQueue.length > 0) {
            centerGrowDraw.apply(this,centerGrowDrawQueue[0]);
            centerGrowDrawQueue.shift();
          } else {
            if(centerGrowDrawQueue.callback instanceof Function) {
              centerGrowDrawQueue.callback();
              centerGrowDrawQueue.callback = null;
            }
            centerGlowEngaged = false;
          }
        }, delay + GlowTextHidingDelay);
      }
    });
  } else {
    score.style.left = String(Screen.clientDimensions[0] / 2 - score.offsetWidth / 2)+"px";
    score.style.top = String(Screen.clientDimensions[1] / 2 - score.offsetHeight / 2)+"px";
    var colorInterval = Graphics.ChangingColor === true?[
      finalTextColor!=textColor?recolor(delay,textColor,finalTextColor,function(color){
        score.style.color = color;
      }, function() {
        colorInterval[0] = false;
      }):false,
      finalShadowColor!=shadowColor && Graphics.TextGlowEffects === true?recolor(delay,shadowColor,finalShadowColor,function(color){
        setGlow(score,GlowMagnitude,color);
      }, function() {
        colorInterval[1] = false;
      }):false
    ]:[false,false];
    if(Graphics.Transparency === true) {
      setTimeout(function() {
        retransparent(score, 1000, 100, 0,function(){
          if(colorInterval[0]) colorInterval[0]();
          if(colorInterval[1]) colorInterval[1]();
          hide(score);
          canvas.removeChild(score);
          if(centerGrowDrawQueue.length > 0) {
            centerGrowDraw.apply(this,centerGrowDrawQueue[0]);
            centerGrowDrawQueue.shift();
          } else {
            if(centerGrowDrawQueue.callback instanceof Function) {
              centerGrowDrawQueue.callback();
              centerGrowDrawQueue.callback = null;
            }
            centerGlowEngaged = false;
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
          centerGrowDrawQueue.shift();
        } else {
          if(centerGrowDrawQueue.callback instanceof Function) {
            centerGrowDrawQueue.callback();
            centerGrowDrawQueue.callback = null;
          }
          centerGlowEngaged = false;
        }
      },delay + GlowTextHidingDelay);
    }
  }
};

function spawn(what) {
  if(field.isFull) return false;
  var funkce, oldMissPenalization;
  switch(what) {
    case superFood:
    case bonusFood: {
      if(bonusFoodSpawned && bonusFoodSpawned.anim instanceof Function) {
        bonusFoodSpawned.anim();
        bonusFoodSpawned.anim = false;
      }
      AchievementBonusFoodFading = false;
      var position = Ego.find().random();
      if(!position) return;
      var lifetime = position[2] * bonusFoodTolerance[3](),
          fadeInterval = (5 <= lifetime?5:lifetime) * currInterval,
          pointer = field.getElement(position[0], position[1]),
          missPenalization = false, reactionTimeout;
      // For testing purposes only
      // console.log("Current bonusFood spawn length tolerance: " + bonusFoodTolerance[3]());
      bonusFoodSpawned = field.getObject(position[0],position[1]);
      bonusFoodSpawned.position = position;
      bonusFoodSpawned.time = Date.now();
      bonusFoodSpawned.lifetime = Infinity;
      if(Graphics.ChangingColor === true) {
        pointer.style.backgroundColor = originalCellColor;
        funkce = recolor(fadeInterval,originalCellColor,foodColors[foodColorIndexes[what]],function(color) {
          pointer.style.backgroundColor = color;
        }, function(){
          bonusFoodSpawned.anim = false;
          pointer.style.backgroundColor = "";
        });
        bonusFoodSpawned.anim = function() {
          funkce();
          pointer.style.backgroundColor = "";
        }
      }
      field.spawn(position[0],position[1],what);
      Snake.cleanCache();     // Provedeme výmaz pathFinding cache, jelikož ve stejném kole pozmìòujeme obsah herního pole
      reactionTimeout = setTimeout(function() { // Reakèní timeout, tahy se spoèítají a zaènou odpoèítávat až po daném poètu milisekund
        reactionTimeout = false;
        movesCounter = 0;
        bonusFoodSpawned.lifetime =
          (missPenalization = Ego.find(bonusFoodSpawned.position).length * bonusFoodTolerance[3]()) || lifetime;
      }, reactionTime);
      // The warp effect is achieved using color changing
      bonusFoodSpawned.extra = what === superFood;
      bonusFoodSpawned.remove = function() {
        movesCounter = 0;
        if(reactionTimeout) {
          clearTimeout(reactionTimeout);
          reactionTimeout = false;
        }
        if(this.anim instanceof Function) {
          this.anim();
          this.anim = false;
        }
        field.clearObject(position[0],position[1]);
        bonusFoodSpawned = null;
      }
      bonusFoodSpawned.despawn = function() {
        AchievementBonusFoodFading = true;
        var despawn = function() {
              bonusFoodSpawned.anim = false;
              AchievementBonusFoodFading = false;
              field.remove(position[0],position[1]);
              field.clearObject(position[0],position[1]);
              if(missPenalization) {
                AchievementsListener.check("missBonusFood");
                ScalingSystem.set(HELP);
              }
              bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
              bonusFoodSpawned = null;
              movesCounter = 0;
              field.clearObject(position[0],position[1]);
            };
        if(this.anim instanceof Function) {
          this.anim();
          this.anim = false;
        }
        if(Graphics.ChangingColor === true) {
          funkce = recolor(fadeInterval,foodColors[foodColorIndexes[bonusFood]],originalCellColor,function(color) {
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
        } else {
          var timeout = setTimeout(despawn, fadeInterval);
          this.anim = function() {
            clearTimeout(timeout);
            field.clearObject(position[0],position[1]);
          }
        }
      }
      if(what === superFood)
        bonusFoodSpawned.warp = function() {
          var warp = function() {
            oldMissPenalization = missPenalization;
            field.spawn(position[0],position[1],bonusFood);
            pointer.style.backgroundColor = "";
            AchievementBonusFoodFading = false;
            movesCounter = 0;
            bonusFoodSpawned.extra = false;
            bonusFoodSpawned.anim = false;
            if(oldMissPenalization) {
              AchievementsListener.check("missSuperFood");
              ScalingSystem.set(HELP);
            }
            bonusFoodSpawned.lifetime = (missPenalization = Ego.find(bonusFoodSpawned.position).length * bonusFoodTolerance[3]()) || bonusFoodSpawned.lifetime;
            bonusFoodSpawnMoves = calcBonusFoodSpawn(Ego.length + 1);
          }
          AchievementBonusFoodFading = true;
          if(this.anim instanceof Function) {
            this.anim();
            this.anim = false;
          }
          if(Graphics.ChangingColor === true) {
            funkce = recolor(fadeInterval,foodColors[foodColorIndexes[superFood]],foodColors[foodColorIndexes[bonusFood]],function(color) {
              pointer.style.backgroundColor = color;
            }, warp);
            this.anim = function() {
              funkce();
              AchievementBonusFoodFading = false;
              pointer.style.backgroundColor = "";
            }
          }
          else {
            var timeout = setTimeout(warp, fadeInterval);
            this.anim = function() {
              clearTimeout(timeout);
              AchievementBonusFoodFading = false;
              bonusFoodSpawned.anim = false;
            }
          }
        }
      break;
    }
    case food:
      // For testing purpose only
      // console.log("Legendary Food Spawn Chance: " + (legendFoodChance[2]()) * 100 + "%");
      if(toss(legendFoodChance[2]())) {
        what = legendFood;
        var OldRegularFoodSpawned = regularFoodSpawned,
            index = 0;
            warp = function() {
              if(++index >= regularFoodSpawned.lifetime) {
                field.movement.removeCallback(warp);
                regularFoodSpawned.warp();
              }
            };
        position = Ego.find().random();
        if(!position) return;
        fadeInterval = 5 * currInterval;
        regularFoodSpawned.position[0] = position[0];
        regularFoodSpawned.position[1] = position[1];
        pointer = field.getElement(position[0],position[1]);
        regularFoodSpawned = field.getObject(position[0],position[1]);
        regularFoodSpawned.position = position;
        regularFoodSpawned.lifetime = position[2] * bonusFoodTolerance[3]();
        regularFoodSpawned.legendary = true;
        regularFoodSpawned.remove = function() {
          field.movement.removeCallback(warp);
          if(reactionTimeout) {
            clearTimeout(reactionTimeout);
            reactionTimeout = false;
          }
          if(this.anim instanceof Function) {
            this.anim();
            this.anim = false;
          }
          field.clearObject(position[0],position[1]);
          regularFoodSpawned = OldRegularFoodSpawned;
        };
        regularFoodSpawned.warp = function() {
          var warp = function() {
            field.spawn(position[0], position[1], food);
            pointer.style.backgroundColor = "";
            AchievementLegendFoodFading = false;
            field.clearObject(position[0],position[1]);
            regularFoodSpawned = OldRegularFoodSpawned;
          };
          AchievementLegendFoodFading = true;
          if(Graphics.ChangingColor === true) {
            funkce = recolor(fadeInterval,foodColors[foodColorIndexes[legendFood]],foodColors[foodColorIndexes[food]],function(color) {
              pointer.style.backgroundColor = color;
            }, warp);
            this.anim = function() {
              funkce();
              AchievementLegendFoodFading = false;
              pointer.style.backgroundColor = "";
            }
          }
          else {
            var timeout = setTimeout(warp, fadeInterval);
            this.anim = function() {
              clearTimeout(timeout);
              AchievementLegendFoodFading = false;
              bonusFoodSpawned.anim = false;
            }
          }
        };
        field.spawn(position[0], position[1], what);
        Snake.cleanCache();     // Provedeme výmaz pathFinding cache, jelikož ve stejném kole pozmìòujeme obsah herního pole
        reactionTimeout = setTimeout(function() { // Reakèní timeout, tahy se spoèítají a zaènou odpoèítávat až po daném poètu milisekund
          reactionTimeout = false;
          regularFoodSpawned.lifetime =
            Ego.find(regularFoodSpawned.position).length * bonusFoodTolerance[3]() || regularFoodSpawned.lifetime;
          field.movement.addCallback(warp);
        }, reactionTime);
      } else {
        position = field.getFree().random();
        regularFoodSpawned.position[0] = position[0];
        regularFoodSpawned.position[1] = position[1];
        field.spawn(position[0],position[1],what);
      }
      break;
    default: {
      position = field.getFree().random();
      field.spawn(position[0],position[1],what);
    }
  }
};

function toss(odds) {
  return Math.random() <= odds;
}

function newThread(f) {
  setTimeout(f, 1);
};

function getPos(obj) {
  var curleft = "getBoundingClientRect" in obj?obj.getBoundingClientRect():[0,0];
  if("getBoundingClientRect" in obj)
    return [
      curleft.left - (Html.clientLeft || Body.clientLeft || 0),
      curleft.top - (Html.clientTop || Body.clientTop || 0)
    ];
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
};

function calculateEllipse(round, x, y, a, b, angle, steps) {
  if(steps === null)
    steps = 36;
  var points = [];

  // Angle is given by Degree Value
  var beta = -angle.degToRad();
  var sinbeta = Math.sin(beta);
  var cosbeta = Math.cos(beta);

  for(var i = 0; i < 360; i += 360 / steps) {
    var alpha = i.degToRad();
    var sinalpha = Math.sin(alpha);
    var cosalpha = Math.cos(alpha);
    if(round) points.push([Math.round(x + (a * cosalpha * cosbeta - b * sinalpha * sinbeta)), Math.round(a * cosalpha * sinbeta + b * sinalpha * cosbeta)]);
    else points.push([x + (a * cosalpha * cosbeta - b * sinalpha * sinbeta), (a * cosalpha * sinbeta + b * sinalpha * cosbeta)]);
  }

  return points;
};

var Cursor = {
  Hide: function() {
    Html.className = "noCursor";
  },
  Show: function() {
    Html.className = "";
  }
};

var colorTransition = function(oldColor, newColor) {
  this.input = [oldColor, newColor];
  this.oldColor = /#(.{2})(.{2})(.{2})/.exec(oldColor).slice(1);
  this.newColor = /#(.{2})(.{2})(.{2})/.exec(newColor).slice(1);
  this.oldColor.forEach(function(item, index, that) {
    that[index] = parseInt(item, 16);
  });
  this.newColor.forEach(function(item, index, that) {
    that[index] = parseInt(item, 16);
  });
}

colorTransition.prototype.calc = function(ratio) {
  if(ratio === 0 || ratio === 1)
    return this.input[ratio];
  var r = ((this.oldColor[0] * 1 / ratio + this.newColor[0] * 1 / (1 - ratio)) / (1 / (1 - ratio) + 1 / ratio)).round().toString(16),
      g = ((this.oldColor[1] * 1 / ratio + this.newColor[1] * 1 / (1 - ratio)) / (1 / (1 - ratio) + 1 / ratio)).round().toString(16),
      b = ((this.oldColor[2] * 1 / ratio + this.newColor[2] * 1 / (1 - ratio)) / (1 / (1 - ratio) + 1 / ratio)).round().toString(16);
  if(r.length === 1) r = "0" + r;
  if(g.length === 1) g = "0" + g;
  if(b.length === 1) b = "0" + b;
  return "#" + r + g + b;
};

Array.prototype.removeByValue = Array.prototype.erase;

Array.prototype.removeByLastValue = function(value) {
  var index = this.lastIndexOf(value);
  return index !== -1?this.remove(index):this.length;
};

var addListener = !window.addEventListener?function(type, listener) {
  document.body.attachEvent("on" + type, listener);
}:function(type, listener) {
  window.addEventListener(type, listener, false);
}, remListener = !window.removeEventListener?function(type, listener) {
  document.body.detachEvent("on" + type, listener);
}:function(type, listener) {
  window.removeEventListener(type, listener, false);
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

Number.prototype.group = function(comma, decimals) {
	var delimit = comma == undefined ? "," : comma,
	    size = decimals == undefined ? 3 : decimals,
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
      temp = delimit + temp;
	}

	return (prefix + temp);
};
