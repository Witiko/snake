function Listener() {
  var enabled = 0,
      callback,
      codes,
      preventDefault = function(e) {
        if(!e) e = window.event;
        e.returnValue = false;
        return false;
      },
      collectKeyboard = function(e) {
        if(!e) e = window.event;
        e.returnValue = false;
        if(e.repeat) return false;
        var output = [];
        if(e.shiftKey) output.push(keyCodes[16])
        if(e.ctrlKey) output.push(keyCodes[17])
        if(e.altKey) output.push(keyCodes[18])
        if(!returnCodes[e.keyCode]) {
          if(keyCodes[e.keyCode]) output.push(keyCodes[e.keyCode]);
          else output.push(l[0] + e.keyCode);
        }
        if(callback && typeof callback == "function") {
          callback({
            "shiftKey" : e.shiftKey,
            "ctrlKey" : e.shiftKey,
            "altKey" : e.altKey,
            "keyCode" : returnCodes[e.keyCode]?null:e.keyCode,
            "keyName" : output.join(", ")
          });
        }
        return false;
      },
      listenToKeyboard = function(e) {
        if(!e) e = window.event;
        if(e.repeat) {
          e.returnValue = false;
          return false;
        }
        var found = -1;
        codes.each(function(code, count) {
          if(
            code["shiftKey"] == e.shiftKey &&
            code["ctrlKey"] == e.ctrlKey &&
            code["altKey"] == e.altKey &&
            (returnCodes[e.keyCode] ||
            (code["keyCode"] == e.keyCode ||
            (typeof code["keyCode"] == "object" &&
            code["keyCode"].indexOf(e.keyCode) >= 0)))
          ) {found = count; return false;}
        });
        if(found == -1) return true;
        if(callback && typeof callback == "function") callback(found);
        e.returnValue = false;
        return false;
      },
      collectMouse = function(e) {
        if(!e) e = window.event;
        e.returnValue = false;
        var button = e.which || e.button;
        var output = [];
        if(e.shiftKey) output.push(keyCodes[16])
        if(e.ctrlKey) output.push(keyCodes[17])
        if(e.altKey) output.push(keyCodes[18])
        if(mouseCodes[button]) output.push(mouseCodes[button]);
        else output.push(l[1] + button);
        if(callback && typeof callback == "function") {
          callback({
            "shiftKey" : e.shiftKey,
            "ctrlKey" : e.shiftKey,
            "altKey" : e.altKey,
            "keyCode" : "M" + button,
            "keyName" : output.join(", ")
          });
        }
        return false;
      },
      listenToMouse = function(e) {
        if(!e) e = window.event;
        var button = e.which || e.button;
        var found = -1;
        codes.each(function(code, count) {
          if(
            code["shiftKey"] == e.shiftKey &&
            code["ctrlKey"] == e.ctrlKey &&
            code["altKey"] == e.altKey &&
            code["keyCode"] == "M" + button ||
            (typeof code["keyCode"] == "object" &&
            code["keyCode"].indexOf("M" + button) >= 0)
          ) {found = count; return false;}
        });
        if(found == -1) return true;
        if(callback && typeof callback == "function") callback(found);
        e.returnValue = false;
        return false;
      }
  this.startCollecting = function(call) {
    if(enabled || !call) return false;
    enabled = 1;
    callback = call;
    addListener("keydown",collectKeyboard);
    addListener("mousedown",collectMouse);
    addListener("contextmenu",preventDefault);
    return true;
  }
  this.stopCollecting = function() {
    if(enabled != 1) return false;
    enabled = 0;
    remListener("keydown",collectKeyboard);
    remListener("mousedown",collectMouse);
    remListener("contextmenu",preventDefault);
    return true;
  }
  this.startListening = function(cod, call) {
    if(enabled || !cod || !call) return false;
    enabled = 2;
    callback = call;
    codes = cod;
    var mouse = false, keyboard = false;
    for(var count = 0; (count < cod.length && (!mouse || !keyboard)); count++) {
      if(typeof cod[count]["keyCode"] == "string") mouse = true;
      else if(typeof cod[count]["keyCode"] == "object") {
        for(var count2 = 0; (count2 < cod[count2]["keyCode"].length && (!mouse || !keyboard)); count2++) {
          if(typeof cod[count]["keyCode"][count2] == "string") mouse = true;
          else keyboard = true;
        }
      }
      else keyboard = true;
    }
    if(keyboard) addListener("keydown", listenToKeyboard);
    if(mouse) {
      addListener("mousedown", listenToMouse);
      addListener("contextmenu", preventDefault);
    }
    return true;
  }
  this.stopListening = function() {
    if(enabled != 2) return;
    enabled = 0;
    remListener("keydown", listenToKeyboard);
    remListener("mousedown", listenToMouse);
    remListener("contextmenu", preventDefault);
  }
  return true;
}
