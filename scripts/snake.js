var TRANSIT = 0,      // Wall collision flags
    SOLID = 1,
    OVERFLOW = 2,
    EMPTY = 0,        // Broad first search cache state flags
    PARTIALLY_FILLED = 1,
    FILLED = 2,
    NONE = 0,         // AI types
    DIRECTIONPICKING = 1;

function Snake(field, opts) {
  if(this === window ||
     !(field instanceof gameField) ||
     !(opts instanceof Object) ||
     opts.head === undefined ||
     opts.body === undefined ||
     opts.length <= 0 ||
     (opts.position instanceof Array) === false ||
     opts.direction > DOWN ||
     opts.direction < LEFT
  ) return;
  var that = this;
  this.head = opts.head;
  this.body = opts.body;
  this.length = opts.length;
  this.AI = opts.automation;
  this.callbacks = opts.callbacks instanceof Object?opts.callbacks:{};
  if(this.AI.movement.lifeTimeManager instanceof lifeTimeManager || this.AI.drawStars) {
    var formerDeathCallback = this.callbacks.death;
    this.callbacks.death = function() {
      if(formerDeathCallback instanceof Function) {
        if(formerDeathCallback.call(that) !== false)
             that.destroy();
      } else that.destroy();
    }
  }
  else
    this.callbacks = {};
  if(opts.collision instanceof Object)
    this.collision = opts.collision;
  this.position = opts.position;
  this.direction = opts.direction;
  this.history = [];
  this.lastCell = [];
  this.alive = true;
  this._ = {
    newDirection: false,
    findPathCache: {
      empty: function() {
        if(this.status !== EMPTY) {
          this.status = EMPTY;
          this.queue.length = 0;
          this.array = null;
          this.arrayLength.length = 0;
          this.arrayLengthPending.length = 0;
          this.arrayLengthChanges.length = 0;
        }
      },
      status: EMPTY,
      queue: [],
      array: null,
      arrayLength: [],
      arrayLengthPending: [],
      arrayLengthChanges: []
    },
    follow: false,
    moveScripts: {
      move: {
        callback: function() {
          this.move(true);
        },
        context: this
      },
      preMove: {
        callback: this.preMove,
        context: this
      }
    },
    length: undefined
  };
  if(this.AI.autoSpawn === true)
    this.spawn();
  this.constructor.instances.push(this);
}

Snake.cleanCache = function() {
  this.instances.forEach(function(instance) {
    instance._.findPathCache.empty.call(instance._.findPathCache);
  });
}

Snake.instances = [];

Snake.prototype.collision = {
  walls: SOLID,
  body: true,
  items: true
};

Snake.prototype.isLastCell = function(position) {
  return (this._.length === this.length    &&
          position[0] === this.lastCell[0] &&
          position[1] === this.lastCell[1]);
};

Snake.prototype.spawn = function() {
  this.history.length = 0;
  var x = this.position[0],
      y = this.position[1],
      that = this,
      snakeLength = this.length;
  if(field.get(x, y) === food) spawn(food);
  field.spawn(x, y, this.head, this.length);
  for(var count = 0; count < snakeLength;) {
    switch(this.direction) {
      case LEFT: x++; break;
      case UP: y++; break;
      case RIGHT: x--; break;
      case DOWN: y--;
    }
    if(field.get(x, y) === food) spawn(food);
    field.spawn(x, y, this.body, this.length - 1 - count);
    this.history[count] = [x, y];
    if(++count === snakeLength) {
      this.lastCell[0] = x;
      this.lastCell[1] = y;
    }
  }
  this._.length = this.length;
  if(this.AI.movement.lifeTimeManager instanceof lifeTimeManager) {
    field.movement.addCallback(this._.moveScripts.move);
    if(this.AI.movement.pursue.method !== NONE || this._.follow !== false)
      field.movement.addFCCallback(this._.moveScripts.preMove);
  }
};

Snake.prototype.destroy = function(silent) {
  if(this.AI.movement.lifeTimeManager instanceof lifeTimeManager) {
    field.movement.removeCallback(this._.moveScripts.move);
    if(this.AI.movement.pursue.method !== NONE || this._.follow !== false)
      field.movement.removeFCCallback(this._.moveScripts.preMove);
  }
  if(this.AI.drawStars === true)
    drawStars(this.position);
  this.alive = false;
  this.constructor.instances.removeByValue(this);
  if(this.callbacks.afterDeath instanceof Function && !silent)
     this.callbacks.afterDeath.call(this);
};

Snake.prototype.changeDirection = function(direction) {
  if(this.direction === LEFT && direction !== LEFT && direction !== RIGHT)
    this._.newDirection = direction;
  else if(this.direction === UP && direction !== UP && direction !== DOWN)
    this._.newDirection = direction;
  else if(this.direction === RIGHT && direction !== RIGHT && direction !== LEFT)
    this._.newDirection = direction;
  else if(this.direction === DOWN && direction !== DOWN && direction !== UP)
    this._.newDirection = direction;
}

Snake.prototype.preMove = function() {
  if(this.AI.movement.pursue.method !== NONE) {             // AI
    switch(this.AI.movement.pursue.method) {
      case DIRECTIONPICKING:
        if(this._.follow === false)
          this.pickDirection();
        break;
    }
  }

  if(this._.follow !== false) {                            // Follow
    var shift = this._.follow.shift();
    this.changeDirection(
      this.getDirection(shift)
    );
    if(this._.follow.length === 0) {
       this._.follow = false;
       if(this.AI.movement.pursue.method === NONE)
        field.movement.removeFCCallback(this._.moveScripts.preMove);
    }
  }
}

Snake.prototype.move = function(callback) {
  if(this._.newDirection !== false) {
    if(this.callbacks.directionChange instanceof Function)
       this.callbacks.directionChange.call(this, this._.newDirection);
    this.direction = this._.newDirection;
    this._.newDirection = false;
  }

  var position = this.getPosition(this.direction),
      x = position[0],
      y = position[1],
      that = this;

  var get = field.get(x, y),
      last = get !== false?this.isLastCell(position):false;

  if((last === false || (
    this.callbacks.tailMiss instanceof Function &&
    this.getVector(
      this.history[this.history.length - 1],
      this.history[this.history.length - 2]
    ) !== this.direction?
      this.callbacks.tailMiss.call(this):false
  ))
  && get === this.body
  && this.collision.body === true)                          // Kolize s tìlem
     this.callbacks.death();
  else if(last === false
         && get !== false
         && get !== this.body
         && this.collision.items === true) {
              if(field.collisionList.indexOf(get) !== -1) { // Kolize s jiným objektem
                this.callbacks.death();
              } else if(this.callbacks.collision instanceof Function) {
                this.callbacks.collision.call(this, x, y, get);
              }
  } else if((x < 0 || x >= width || y < 0 || y >= height)
          && this.collision.walls === SOLID)                // Kolize se stìnou
             this.callbacks.death();
  else {                                                   // Samotné provedení pohybu
    this._.findPathCache.empty.call(this._.findPathCache); // Vymazání findPath cache
    var increaseSize = this._.length !== this.length;
    if(increaseSize) {
      this._.length++;
      if(this.callbacks.lengthChange instanceof Function)
        this.callbacks.lengthChange.call(this, this._.length);
    }
    this.history.unshift(this.position.slice(0));
    if(this.collision.body === true) {
      field.spawn(x, y, this.head, this.length);
      // Non-strict redrawing
      if(this.position[0] >= 0 &&
         this.position[0] < width &&
         this.position[1] >= 0 &&
         this.position[1] < height)
        field.spawn(this.position[0], this.position[1], this.body);
        if(increaseSize === false && !(
          this.history[this.history.length - 1][0] === x &&
          this.history[this.history.length - 1][1] === y
        )) field.remove(this.history[this.history.length - 1][0], this.history[this.history.length - 1][1]);
        // Refreshing the lifeTimeManager values
        if(increaseSize === true && this.AI.movement.lifeTimeManager.get(this.history[0], this.history[1]) !== this.length - 1) {
          this.history.forEach(function(position, index) {
            that.AI.movement.lifeTimeManager.set(position[0], position[1],
                                                 that.length - index - 1);
          });
        }
    }
    this.position[0] = x;
    this.position[1] = y;
    if(this.collision.body !== true) {
      // Too strict, not needed unless the snake can go through its own body
      this.history.each(function(history, index) {
        if(history[0] >= 0 &&
           history[0] < width &&
           history[1] >= 0 &&
           history[1] < height) {
          if(index < that.history.length - 1)
            field.spawn(history[0], history[1], that.body, that.length - index - 1);
          else if(increaseSize === false)
            field.remove(history[0], history[1]);
          else if(that.AI.movement.lifeTimeManager.get(that.history[0], that.history[1]) !== that.length - 1)
            that.AI.movement.lifeTimeManager.set(history[0], history[1], that.length - index - 1)
        }
      }, this.history.length - 1, 0);
    }
    // Unless we wanna increase the snake's size, we remove its last cell
    if(increaseSize === false)
      this.history.pop();
    // Last cell info update
    this.lastCell[0] = this.history[this.history.length - 1][0];
    this.lastCell[1] = this.history[this.history.length - 1][1];
    if(this.collision.body === false)
      field.spawn(x, y, this.head, this.length);
    if(callback === true && this.callbacks.move instanceof Function)
      this.callbacks.move.call(this);
  }
};

Snake.prototype.pickDirection = function() {
  var direction = {
        score: [],
        position: [],
        mask: []
      }, ray;

  // Inicializace
  for(var dir = LEFT; dir <= DOWN; dir++) {
    if((dir === LEFT  && this.direction !== RIGHT) ||
       (dir === UP    && this.direction !== DOWN) ||
       (dir === RIGHT && this.direction !== LEFT) ||
       (dir === DOWN  && this.direction !== UP)) {
         direction.position.push(this.getPosition(dir));
         direction.score.push((
           collisionList.indexOf(field.get(
             direction.position[direction.position.length - 1][0],
             direction.position[direction.position.length - 1][1]
           )) !== -1 &&
           this.AI.movement.lifeTimeManager.get(
             direction.position[direction.position.length - 1][0],
             direction.position[direction.position.length - 1][1]
           ) !== 0) ||
           direction.position[direction.position.length - 1][0] < 0 ||
           direction.position[direction.position.length - 1][0] >= width ||
           direction.position[direction.position.length - 1][1] < 0 ||
           direction.position[direction.position.length - 1][1] >= height?-Infinity:0
         );
         direction.mask.push(dir);
       }
  }

  // Obodování
  for(dir = 0; dir < 3; dir++) {
    if(direction.score[dir] === -Infinity) continue;
    // Tunnel check
    if(collisionList.indexOf(field.get.apply(field, this.getPosition(direction.mask[dir] === LEFT || direction.mask[dir] === RIGHT?UP:LEFT, direction.position[dir]))) !== -1 &&
       collisionList.indexOf(field.get.apply(field, this.getPosition(direction.mask[dir] === LEFT || direction.mask[dir] === RIGHT?DOWN:RIGHT, direction.position[dir]))) !== -1) {
      direction.score[dir] = -Number.MAX_VALUE;
      continue;
    }
    ray = this.castRay(direction.mask[dir])[0];
    direction.score[dir] -= calcDistance(direction.position[dir],
                                         this.getPoint(),
                                         this.collision.walls !== TRANSIT);
    direction.score[dir] -= ray < (direction.mask[dir] === LEFT || direction.mask[dir] === RIGHT?width:height)  * 0.25?
                      (1 - ray / ((direction.mask[dir] === LEFT || direction.mask[dir] === RIGHT?width:height)) * 0.25) *
                       ((width + height) * (this.collision.walls === TRANSIT?0.5:1)):0;
  }

  // Navrácení náhodného z nejvýše obodovaných smìrù
  dir = direction.score.maxArray().random();
  this.changeDirection(direction.mask[dir]);
};

Snake.prototype.getPosition = function(direction, position) {
  var x = position instanceof Array?position[0]:this.position[0],
      y = position instanceof Array?position[1]:this.position[1];
  switch(direction) {
    case LEFT:
      x--; break;
    case UP:
      y--; break;
    case RIGHT:
      x++; break;
    case DOWN:
      y++; break;
  }
  if(this.collision.walls === TRANSIT) {
    if(x < 0) x = width - 1;
    else if(x >= width) x = 0;
    if(y < 0) y = height - 1;
    else if(y >= height) y = 0;
  }
  return [x, y];
};

Snake.prototype.getVector = function() {
  var position = arguments;
  if(this.collision.walls === TRANSIT) {
    if(position[0][0] === 0 && position[1][0] === width - 1 &&
       position[0][1] === position[1][1]) return LEFT;
    if(position[0][0] === position[1][0] &&
       position[0][1] === 0 && position[1][1] === height - 1) return UP;
    if(position[0][0] === width - 1 && position[1][0] === 0 &&
       position[0][1] === position[1][1]) return RIGHT;
    if(position[0][0] === position[1][0] &&
       position[0][1] === height - 1 && position[1][1] === 0) return DOWN;
  }
  if(position[0][0]  >  position[1][0] &&
     position[0][1] === position[1][1]) return LEFT;
  if(position[0][0] === position[1][0] &&
     position[0][1]  >  position[1][1]) return UP;
  if(position[0][0]  <  position[1][0] &&
     position[0][1] === position[1][1]) return RIGHT;
  if(position[0][0] === position[1][0] &&
     position[0][1]  <  position[1][1]) return DOWN;
  return -1;
}

Snake.prototype.getDirection = function(position, originalPosition) {
  var  x = position[0],
       y = position[1],
      _x = originalPosition instanceof Array?originalPosition[0]:this.position[0],
      _y = originalPosition instanceof Array?originalPosition[1]:this.position[1],
      collision = this.collision.walls !== TRANSIT;
  originalPosition = originalPosition || this.position;

  if(x === _x - 1 &&
     y === _y) return LEFT;
  if(x === _x &&
     y === _y - 1) return UP;
  if(x === _x + 1 &&
     y === _y) return RIGHT;
  if(x === _x &&
     y === _y + 1) return DOWN;

  if(collision === false) {
    if(x === width - 1 &&
      _x === 0 &&
       y === _y) return LEFT;
    if(x === _x &&
       y === height - 1 &&
      _y === 0) return UP;
    if(x === 0 &&
      _x === width - 1 &&
       y === _y) return RIGHT;
    if(x === _x &&
       y === 0 &&
      _y === height - 1) return DOWN;
  }

  return -1;
};

Snake.prototype.castRay = function(direction) {
  if(direction === undefined)
    direction = this.direction;
  var currPosition = this.position,
      startPosition = this.position,
      rayLength = 0;
  while((currPosition = this.getPosition(direction, currPosition)) &&
        (collisionList.indexOf(field.get(currPosition[0], currPosition[1])) === -1 ||
         this.AI.movement.lifeTimeManager.get(currPosition[0], currPosition[1]) <= rayLength) &&
         currPosition[0] >= 0 &&
         currPosition[0] < width &&
         currPosition[1] >= 0 &&
         currPosition[1] < height &&
        (currPosition[0] === startPosition[0] &&
         currPosition[1] === startPosition[1]) === false) {
    rayLength++;
  }

  return (currPosition[0] === startPosition[0] &&
          currPosition[1] === startPosition[1]) === false?[
           rayLength,
           currPosition
         ]:[
           Infinity,
           startPosition
         ]
};

Snake.prototype.find = function(destination) {
  if(!this.alive || destination instanceof Array && (
     (
       destination[0] === this.position[0] &&
       destination[1] === this.position[1]
     ) ||
     (
       destination[0] >= width ||
       destination[0] < 0 ||
       destination[1] >= height ||
       destination[1] < 0
     )))
       return [];
    if(destination instanceof Array)
       destination = [
         destination[0],
         destination[1]
       ];
  else if(destination === undefined)
    destination = true;
  var depth = 0,
      cache = this._.findPathCache,
      accessSearch = Boolean.isBoolean(destination),
      array = cache.status === EMPTY?(cache.array = this.AI.movement.lifeTimeManager.getArray()):cache.array,
      arrayLength = cache.arrayLength,
      arrayLengthPending = cache.arrayLengthPending,
      arrayLengthChanges = cache.arrayLengthChanges,
      currLoc = this.position, currPos,
      originalLength = this.length,
      queue = cache.status === EMPTY?(cache.queue = [currLoc, true]):cache.queue,
      temp = [], result = [], from,
      get = function(direction, collision, queue) {
        var newPosition = this.getPosition(direction, queue[0]);
        if(collision === true) {
         if(array[newPosition[0]][newPosition[1]] < array[queue[0][0]][queue[0][1]] && (array[newPosition[0]][newPosition[1]] === 0 || (
            array[queue[0][0]][queue[0][1]] - array[newPosition[0]][newPosition[1]] >
              (queue[0][0] in arrayLength && queue[0][1] in arrayLength[queue[0][0]]?arrayLength[queue[0][0]][queue[0][1]]:originalLength)
              + (
              (queue[0][0] in arrayLength && queue[0][1] in arrayLength[queue[0][0]]?arrayLength[queue[0][0]][queue[0][1]]:originalLength)
            - (newPosition[0] in arrayLength && newPosition[1] in arrayLength[newPosition[0]]?arrayLength[newPosition[0]][newPosition[1]]:originalLength)
            ) + (
              arrayLengthPending[queue[0][0]] instanceof Array === true && Number.isNumber(arrayLengthPending[queue[0][0]][queue[0][1]])?(
                arrayLengthPending[queue[0][0]][queue[0][1]] > 0?1:0
              ):0
            ) && array[newPosition[0]][newPosition[1]] <= originalLength))) {
            return newPosition[0] >= 0 &&
                   newPosition[0] < width &&
                   newPosition[1] >= 0 &&
                   newPosition[1] < height?newPosition:false;
            } else return false;
        } else {
          return newPosition[0] >= 0 &&
                 newPosition[0] < width &&
                 newPosition[1] >= 0 &&
                 newPosition[1] < height?newPosition:false;
        }
      }, move = function(currPos, destination) {
        var bonus = foodBonuses[field.get(destination[0], destination[1])],
            pending = arrayLengthPending[currPos[0]] instanceof Array &&
                      Number.isNumber(arrayLengthPending[currPos[0]][currPos[1]])?
                        arrayLengthPending[currPos[0]][currPos[1]]:0;
        if(bonus !== undefined) {
          if(arrayLengthChanges[destination[0]] instanceof Array === false)
            arrayLengthChanges[destination[0]] = [];
          arrayLengthChanges[destination[0]][destination[1]] = bonus;
        }
        array[destination[0]][destination[1]] = array[currPos[0]][currPos[1]] + 1;
        if(!(destination[0] in arrayLength))
          arrayLength[destination[0]] = [];
        arrayLength[destination[0]][destination[1]] = bonus === undefined?
          (currPos[0] in arrayLength && currPos[1] in arrayLength[currPos[0]]?arrayLength[currPos[0]][currPos[1]]:originalLength)
             + (pending > 0?1:0):
          (currPos[0] in arrayLength && currPos[1] in arrayLength[currPos[0]]?arrayLength[currPos[0]][currPos[1]]:originalLength)
             + (pending + bonus * lengthMultiplier > 1?1:bonus * lengthMultiplier);
        if(((bonus !== undefined && (bonus * lengthMultiplier > 1)) || pending !== 0) && pending + (bonus || 0) * lengthMultiplier - 1 > 0) {
          if(arrayLengthPending[destination[0]] instanceof Array === false)
            arrayLengthPending[destination[0]] = [];
          arrayLengthPending[destination[0]][destination[1]] = pending + (bonus || 0) * lengthMultiplier - 1;
        }
      }, fill = function(record) {
        while(queue.length > 0) {
          currPos = queue[0].slice(0);
          temp[0] = get.call(this, LEFT, true, queue);
          temp[1] = get.call(this, UP, true, queue);
          temp[2] = get.call(this, RIGHT, true, queue);
          temp[3] = get.call(this, DOWN, true, queue);
          if(accessSearch === false &&
            ((temp[0] instanceof Array && temp[0][0] === destination[0] && temp[0][1] === destination[1]) ||
             (temp[1] instanceof Array && temp[1][0] === destination[0] && temp[1][1] === destination[1]) ||
             (temp[2] instanceof Array && temp[2][0] === destination[0] && temp[2][1] === destination[1]) ||
             (temp[3] instanceof Array && temp[3][0] === destination[0] && temp[3][1] === destination[1]))) {
            move(currPos, destination); break;
          }
          temp.forEach(function(a){
            if(a !== false) {
              move(currPos, a);
              queue.push(a);
            }
          });
          queue.shift();
          if(queue[0] === true) {
            depth++; queue.shift();
            if(queue.length > 0) queue.push(true);
          }
        }
        if(record === true) {
          if(queue.length === 0) {
            if(cache.status !== FILLED)
               cache.status  =  FILLED;
          } else if(cache.status !== PARTIALLY_FILLED)
                    cache.status  =  PARTIALLY_FILLED;
        }
      }, scour = function() {
        if(array[destination[0]][destination[1]] <= originalLength)
          return false;
        var positions = [
          this.getPosition(LEFT, destination),
          this.getPosition(UP, destination),
          this.getPosition(RIGHT, destination),
          this.getPosition(DOWN, destination)
        ], score = [
          array[positions[0][0]]?array[positions[0][0]][positions[0][1]]:undefined,
          array[positions[1][0]]?array[positions[1][0]][positions[1][1]]:undefined,
          array[positions[2][0]]?array[positions[2][0]][positions[2][1]]:undefined,
          array[positions[3][0]]?array[positions[3][0]][positions[3][1]]:undefined
        ],
        result = score.indexOf(
          array[destination[0]][destination[1]] - 1
        );
        return result === -1?false:positions[result];
      }, find = function() {
        if(from instanceof Array === false)
          return;
        if(from[0] === currLoc[0] &&
           from[1] === currLoc[1]) {
          result[0] = destination;
          return;
        }
        result[0] = from;
        result[1] = destination;
        result.forEach(function(a) {
          if(arrayLengthChanges[a[0]] instanceof Array && Number.isNumber(arrayLengthChanges[a[0]][a[1]]))
            a[2] = arrayLengthChanges[a[0]][a[1]];
        });
        temp.length = 0;
        if(result[0][0] === currLoc[0] && result[0][1] === currLoc[1]) {
          return result.slice(1);
        } else {
          while(true) {
            temp[0] = get.call(this, LEFT, false, result);
            temp[1] = get.call(this, UP, false, result);
            temp[2] = get.call(this, RIGHT, false, result);
            temp[3] = get.call(this, DOWN, false, result);
            if((temp[0] instanceof Array && temp[0][0] === currLoc[0] && temp[0][1] === currLoc[1] && array[result[0][0]][result[0][1]] <= ((temp[1] instanceof Array?array[temp[1][0]][temp[1][1]]:-Infinity) > originalLength?array[temp[1][0]][temp[1][1]]:Infinity)
                                                                                                   && array[result[0][0]][result[0][1]] <= ((temp[2] instanceof Array?array[temp[2][0]][temp[2][1]]:-Infinity) > originalLength?array[temp[2][0]][temp[2][1]]:Infinity)
                                                                                                   && array[result[0][0]][result[0][1]] <= ((temp[3] instanceof Array?array[temp[3][0]][temp[3][1]]:-Infinity) > originalLength?array[temp[3][0]][temp[3][1]]:Infinity)) ||
               (temp[1] instanceof Array && temp[1][0] === currLoc[0] && temp[1][1] === currLoc[1] && array[result[0][0]][result[0][1]] <= ((temp[0] instanceof Array?array[temp[0][0]][temp[0][1]]:-Infinity) > originalLength?array[temp[0][0]][temp[0][1]]:Infinity)
                                                                                                   && array[result[0][0]][result[0][1]] <= ((temp[2] instanceof Array?array[temp[2][0]][temp[2][1]]:-Infinity) > originalLength?array[temp[2][0]][temp[2][1]]:Infinity)
                                                                                                   && array[result[0][0]][result[0][1]] <= ((temp[3] instanceof Array?array[temp[3][0]][temp[3][1]]:-Infinity) > originalLength?array[temp[3][0]][temp[3][1]]:Infinity)) ||
               (temp[2] instanceof Array && temp[2][0] === currLoc[0] && temp[2][1] === currLoc[1] && array[result[0][0]][result[0][1]] <= ((temp[0] instanceof Array?array[temp[0][0]][temp[0][1]]:-Infinity) > originalLength?array[temp[0][0]][temp[0][1]]:Infinity)
                                                                                                   && array[result[0][0]][result[0][1]] <= ((temp[1] instanceof Array?array[temp[1][0]][temp[1][1]]:-Infinity) > originalLength?array[temp[1][0]][temp[1][1]]:Infinity)
                                                                                                   && array[result[0][0]][result[0][1]] <= ((temp[3] instanceof Array?array[temp[3][0]][temp[3][1]]:-Infinity) > originalLength?array[temp[3][0]][temp[3][1]]:Infinity)) ||
               (temp[3] instanceof Array && temp[3][0] === currLoc[0] && temp[3][1] === currLoc[1] && array[result[0][0]][result[0][1]] <= ((temp[0] instanceof Array?array[temp[0][0]][temp[0][1]]:-Infinity) > originalLength?array[temp[0][0]][temp[0][1]]:Infinity)
                                                                                                   && array[result[0][0]][result[0][1]] <= ((temp[1] instanceof Array?array[temp[1][0]][temp[1][1]]:-Infinity) > originalLength?array[temp[1][0]][temp[1][1]]:Infinity)
                                                                                                   && array[result[0][0]][result[0][1]] <= ((temp[2] instanceof Array?array[temp[2][0]][temp[2][1]]:-Infinity) > originalLength?array[temp[2][0]][temp[2][1]]:Infinity)))
               break;
            temp.forEach(function(a, index) {
              if(a !== false && array[a[0]][a[1]] === array[result[0][0]][result[0][1]] - 1) {
                if(arrayLengthChanges[a[0]] instanceof Array &&
                   Number.isNumber(arrayLengthChanges[a[0]][a[1]])) {
                  a[2] = arrayLengthChanges[a[0]][a[1]][1];
                }
                result.unshift(a); return false;
              }
            });
          }
        }
      }

  if(cache.status === EMPTY) { // If the cache is empty, we carry out a breadth-first search
    fill.call(this, true);
    from = queue[0];
  } else if(cache.status === PARTIALLY_FILLED) {
    if(accessSearch === false) {
      if((from = scour.call(this)) === false) { // Were the cache already filled we look for our destination
        fill.call(this, true);                   // If we find it, we use the data at hand
        from = queue[0];                   // Otherwise we broaden our search
      }
    } else fill.call(this, true);
  } else if(accessSearch === false) {
    from = scour.call(this);
    find.call(this);
  }

  if(queue.length === 0) {  // Either path not found / the cache is already full or we're not looking for a path, but for all accessible places
    if(accessSearch === true) {
      array.forEach(function(column, x) {
        column.forEach(function(cell, y) {
          if(((destination && cell  >  0)  ||
             (!destination && cell === 0)) && field.get(x, y) === false)
            result.push([x, y, destination?
              cell - originalLength:
              calcDistance(
                Ego.position,
                [x, y],
                that.collision.walls === SOLID
              )
            ]);
        });
      });
    }
  } else find.call(this);   // Now we just find the most feasible way back to the snake
  return result;
};

Snake.prototype.follow = function(passedPath) {
  if(passedPath.length > 0) {
    this._.follow = passedPath;
    if(this.AI.movement.pursue.method === NONE)
      field.movement.addFCCallback(this._.moveScripts.preMove);
  }
};

Snake.prototype.getPoint = function() {
  var point, that = this;
  this.AI.movement.pursue.point.forEach(function(f){
    if(!point) {
        point = f.call(that);
    }
  });
  return point;
};
