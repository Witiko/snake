function Listener(keyCodes, callOnUnknown, callback) {
  var preventDefault = function(e) {
        e = e || event;
        return (e.returnValue = false);
      }, listen = Array.isArray(keyCodes)?function(e) {
        e = e || event;
        var keyCode = e.which || e.keyCode;
        if(!keyCodes.some(function(subArray, i) {
          if((subArray instanceof Array && subArray.indexOf(keyCode) !== -1) ||
              subArray === keyCode) {
            callback(i);
            return true;
          }
        }) && callOnUnknown) callback(-1);
      }:function(e) {
        e = e || event;
        if(keyCodes !== (e.which || e.keyCode)) {
          if(callOnUnknown) callback(-1);
        } else callback();
      };

  this.startListening = function() {
    addListener("keydown", listen);
    addListener("contextmenu", preventDefault);
  }; this.stopListening = function() {
    remListener("keydown", listen);
    remListener("contextmenu", preventDefault);
  };
}

function PressAndRelease(keyCodes, cDown, cUp) {
  var down, up, pressed;

  if(Array.isArray(keyCodes)) {
    pressed = new Array(keyCodes.length);
    down = function(e) {
      e = e || event;
      var keyCode = e.which || e.keyCode;
      keyCodes.some(function(subArray, i) {
        if(((subArray instanceof Array && subArray.indexOf(keyCode) !== -1) ||
             subArray === keyCode) && !pressed[i]) {
          pressed[i] = true; cDown(i);
          return true;
        }
      });
    }; up = function(e) {
      e = e || event;
      var keyCode = e.which || e.keyCode;
      keyCodes.some(function(subArray, i) {
        if(((subArray instanceof Array && subArray.indexOf(keyCode) !== -1) ||
             subArray === keyCode) && pressed[i]) {
          pressed[i] = false; cUp(i);
          return true;
        }
      });
    }; this.stopListening = function() {
      pressed = new Array(keyCodes.length);
      remListener("keydown", down);
      remListener("keyup", up);
    };
  } else {
    pressed = false;
    down = function(e) {
      e = e || event;
      if(keyCodes === (e.which || e.keyCode) && !pressed) {
        pressed = true; cDown();
      }
    }; up = function(e) {
      e = e || event;
      if(keyCodes === (e.which || e.keyCode) && pressed) {
        pressed = false; cUp();
      }
    }; this.stopListening = function() {
      pressed = false;
      remListener("keydown", down);
      remListener("keyup", up);
    };
  }

  this.startListening = function() {
    addListener("keydown", down);
    addListener("keyup", up);
  };
};
