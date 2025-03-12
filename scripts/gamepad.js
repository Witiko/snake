var axesLog   = {},
    axesState = {},
    fake = document.createEventObject?function(eventName, keyCode) {
  var eventObject = document.createEventObject();
  evt.keyCode = keyCode;
  Body.fireEvent("on" + eventName, eventObject);
}:function(eventName, keyCode) {
  var evt = document.createEvent("HTMLEvents");
  evt.initEvent(eventName, true, true);
  evt.keyCode = keyCode;
  Body.dispatchEvent(evt);
}; addListener("MozGamepadConnected",    connected, false);
   addListener("MsGamepadConnected",     connected, false);
   addListener("OGamepadConnected",      connected, false);
   addListener("WebkitGamepadConnected", connected, false);
   addListener("gamepadConnected",       connected, false);

   addListener("MozGamepadDisconnected",    disconnected, false);
   addListener("MsGamepadDisconnected",     disconnected, false);
   addListener("OGamepadDisconnected",      disconnected, false);
   addListener("WebkitGamepadDisconnected", disconnected, false);
   addListener("gamepadDisconnected",       disconnected, false);

   addListener("MozGamepadButtonDown",    keydown, false);
   addListener("MsGamepadButtonDown",     keydown, false);
   addListener("OGamepadButtonDown",      keydown, false);
   addListener("WebkitGamepadButtonDown", keydown, false);
   addListener("gamepadButtonDown",       keydown, false);

   addListener("MozGamepadButtonUp",    keyup, false);
   addListener("MsGamepadButtonUp",     keyup, false);
   addListener("OGamepadButtonUp",      keyup, false);
   addListener("WebkitGamepadButtonUp", keyup, false);
   addListener("gamepadButtonUp",       keyup, false);

   addListener("MozGamepadAxisMove",    axisMovement, false);
   addListener("MsGamepadAxisMove",     axisMovement, false);
   addListener("OGamepadAxisMove",      axisMovement, false);
   addListener("WebkitGamepadAxisMove", axisMovement, false);
   addListener("gamepadAxisMove",       axisMovement, false);

function buttonEvent(button, eventType) {
  switch(button) {
    case 0:  return fake(eventType,    enter);
    case 1:  return fake(eventType, pause[0]);
    case 12: return fake(eventType,    up[0]);
    case 13: return fake(eventType,  down[0]);
    case 14: return fake(eventType,  left[0]);
    case 15: return fake(eventType, right[0]);
  }
} function keydown(e) {
  buttonEvent((e || event).button, "keydown");
} function keyup(e) {
  buttonEvent((e || event).button, "keyup");
} function connected(e) {
  e = (e || event).gamepad; console.log(e.id + " connected!");
  axesLog[e.id] = e.axes.length < 4?[[e.axes[0],
                                      e.axes[1]]]:[[
                                      e.axes[0],
                                      e.axes[1]],[
                                      e.axes[2],
                                      e.axes[3]]];
  axesState[e.id] = []; getAxisState(e.id);
} function disconnected(e) {
  e = (e || event).gamepad.id;
  console.log(e + " disconnected!");
  delete axesLog[e];
  delete axesState[e];
} function getAxisState(gamepadId) {
  axesLog[gamepadId].forEach(function(axis, index) {
    axesState[gamepadId][index] = axis[0] < 0.5 && axis[0] > -0.5 && axis[1] < 0.5 && axis[1] > -0.5?null:(
       axis[1] < 0?
      (axis[0] < 0?(-axis[0] > -axis[1]? left[0]:  up[0]):
                   ( axis[0] > -axis[1]?right[0]:  up[0])):
      (axis[0] < 0?(-axis[0] >  axis[1]? left[0]:down[0]):
                   ( axis[0] >  axis[1]?right[0]:down[0]))
    );
  });
} function axisMovement(e) {
  e = e || event;
  var currentState = axesState[e.gamepad.id].copy(),
          newState = axesState[e.gamepad.id],
               log = axesLog[  e.gamepad.id];
  for(var i = 0, l = e.gamepad.axes.length > 4?4:e.gamepad.axes.length; i !== l; i++)
    log[Math.floor(i / 2)][i % 2] = e.gamepad.axes[i]; getAxisState(e.gamepad.id);
  for(var i = 0, l = newState.length; i !== l; i++) {
         if(!currentState[i]  &&   newState[i]) fake("keydown",   newState[i]);
    else if( currentState[i]  &&  !newState[i]) fake("keyup", currentState[i]);
    else if( currentState[i] !==   newState[i]) {
      fake("keyup", currentState[i]);
      fake("keydown",   newState[i]);
    }
  }
}

 // TEMPORARY, WebKit fix


function webkitConnect() {
  var webkitGamepads = navigator.webkitGetGamepads?navigator.webkitGetGamepads():navigator.webkitGamepads;
  if(webkitGamepads) Array.forEach(webkitGamepads, function(gamepad) { // A temporary solution for webkit
    if(gamepad) connected({gamepad: gamepad});
  });
} addListener("keydown", function(e) {
  if((e || event).keyCode === 71) webkitConnect();
}); webkitConnect();
