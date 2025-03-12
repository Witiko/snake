function Listener(keyCodes, callOnUnknown, callback) {
  var preventDefault = function(e) {
        e = e || event;
        return (e.returnValue = false);
      }, listen = function(e) {
        e = e || event;
        var keyCode = e.which || e.keyCode,
            success = array?!keyCodes.each(function(subArray, i) {
              if((subArray instanceof Array && subArray.indexOf(keyCode) !== -1) ||
                  subArray === keyCode) {
                callback(i);
                return false;
              }
            }):(keyCodes === keyCode?callback( i):true);
        if(!success && callOnUnknown)callback(-1);
      }, array = keyCodes instanceof Array;

  this.startListening = function() {
    addListener("keydown", listen);
    addListener("contextmenu", preventDefault);
  }
  this.stopListening = function() {
    remListener("keydown", listen);
    remListener("contextmenu", preventDefault);
  }
}
