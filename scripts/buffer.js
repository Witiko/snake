var Buffer = (function() {
  var that; return (that = {
    _private: {
      snake: undefined,
      buffered: [],
      rewrite: false,
      active: false,
      move: function() {
        if(that._private.active) {
          that._private.snake.changeDirection(that._private.buffered.shift());
          that._private.active = !!that._private.buffered.length;
          that._private.rewrite = true;
        }
      }
    },
    clear: function() {
      this._private.buffered.length = 0;
      this._private.rewrite = false;
      this._private.active = false;
    },
    hit: function(keyCode) {
      if(this._private.rewrite) {
        this._private.buffered.length = 1;
        this._private.buffered[0] = keyCode;
        this._private.rewrite = false;
      }
      else
        this._private.buffered.push(keyCode);
      this._private.active = true;
    },
    register: function(snake) {
      this._private.snake = snake;
      field.movement.addFCCallback(this._private.move);
    },
    unregister: function() {
      delete this._private.snake;
      this.clear();
      field.movement.removeFCCallback(this._private.move);
    }
  });
})();