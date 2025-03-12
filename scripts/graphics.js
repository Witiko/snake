function rotate(object,time,startDeg,finalDeg,callback) {
  var calls = [];
  var ticks = Math.round(time / (1000 / Graphics.FramesPerSecond));
  var delta = finalDeg - startDeg;
  var diff = delta / ticks;
  for(var index = 0; index <= ticks; index++) {
    (function(index){
        calls.push(setTimeout(function(){
            var result = index===ticks?finalDeg:startDeg+diff*index;
            setAngle(object, result);
            if(index === ticks && callback instanceof Function) callback();
        },index*(1000 / Graphics.FramesPerSecond)));
    })(index);
  }
  return function() {
    calls.forEach(function(call) {
      clearTimeout(call);
    });
  }
}

// ----------------------------------------------

function move(object,time,x,y,x2,y2,regardWindow,callback) {
  if(object.style.position !== "absolute") object.style.position = "absolute";
  var calls = [];
  var ticks = Math.round(time / (1000 / Graphics.FramesPerSecond));
  var delta = [x2 - x, y2 - y];
  var diff = [delta[0] / ticks, delta[1] / ticks];
  var previous = [false,false];
  for(var index = 0; index <= ticks; index++) {
    if(previous[0] !== (index === ticks?x2:Math.round(x+diff[0]*index))
    || previous[1] !== (index === ticks?y2:Math.round(y+diff[1]*index))) (function(index){
        calls.push(setTimeout(function(){
            if(index === ticks) {
              previous = [x2,y2];
            } else {
              previous = [Math.round(x+diff[0]*index),Math.round(y+diff[1]*index)];
              if(regardWindow) {
                if(previous[0] + object.offsetWidth > Screen.clientDimensions[0]) {
                  previous[0] = Screen.clientDimensions[0] - object.offsetWidth - (TextShadows?3:0);
                } else if(previous[0] < 0) {
                  previous[0] = 0;
                } if(previous[1] + object.offsetHeight > Screen.clientDimensions[1]) {
                  previous[1] = Screen.clientDimensions[1] - object.offsetHeight - (TextShadows?3:0);
                } else if(previous[1] < 0) {
                  previous[1] = 0;
                }
              }
            }
            object.style.left = String(previous[0]) + "px";
            object.style.top = String(previous[1]) + "px";
            if(index === ticks && callback instanceof Function) callback();
        },index*(1000 / Graphics.FramesPerSecond)));
    })(index);
  }
  return function() {
    calls.forEach(function(call) {
      clearTimeout(call);
    });
  }
}

// ----------------------------------------------

function textMove(object, time, x, y, x2, y2, shadow, regardWindow, callback) {
  if(object.style.position !== "absolute") object.style.position = "absolute";
  var calls = [];
  var ticks = Math.round(time / (1000 / Graphics.FramesPerSecond));
  var delta = [x2 - x, y2 - y];
  var diff = [delta[0] / ticks, delta[1] / ticks];
  var previous = [false,false];
  for(var index = 0; index <= ticks; index++) {
    if(previous[0] !== (index === ticks?x2:Math.round(x+diff[0]*index))
    || previous[1] !== (index === ticks?y2:Math.round(y+diff[1]*index))) (function(index){
        calls.push(setTimeout(function(){
            if(index === ticks) {
              previous = [x2,y2];
            } else {
              previous = [Math.round(x+diff[0]*index),Math.round(y+diff[1]*index)];
              if(regardWindow) {
                if(previous[0] + object.offsetWidth + (shadow?shadow / 2:0) > Screen.clientDimensions[0]) {
                  previous[0] = Screen.clientDimensions[0] - object.offsetWidth - (shadow?shadow / 2:0);
                } else if(previous[0] < (shadow?shadow / 2:0)) {
                  previous[0] = shadow?shadow / 2:0;
                } if(previous[1] + object.offsetHeight + (shadow?shadow / 2:0) > Screen.clientDimensions[1]) {
                  previous[1] = Screen.clientDimensions[1] - object.offsetHeight - (shadow?shadow / 2:0);
                } else if(previous[1] < (shadow?shadow / 2:0)) {
                  previous[1] = shadow?shadow / 2:0;
                }
              }
            }
            object.style.left = String(previous[0]) + "px";
            object.style.top = String(previous[1]) + "px";
            if(index === ticks && callback instanceof Function) callback();
        },index*(1000 / Graphics.FramesPerSecond)));
    })(index);
  }
  return function() {
    calls.forEach(function(call) {
      clearTimeout(call);
    });
  }
}

// ----------------------------------------------

function textResize(object,time,oldsize,newsize,partialCallback,callback) {
  var calls = [];
  var ticks = Math.round(time / (1000 / Graphics.FramesPerSecond));
  var delta = newsize - oldsize;
  var diff = delta / ticks;
  var last = 0;
  var lastTooBig = false;
  var previous = false;
  for(var index = 0; index <= ticks; index++) {
  if(previous !== (index === ticks?newsize:Math.round(oldsize+diff*index))) (function(index){
          calls.push(setTimeout(function(){
              previous = index === ticks?newsize:Math.round(oldsize+diff*index);
              var left = object.style.position==="absolute"?Number(object.style.left.replace("px","")):0;
              var top = object.style.position==="absolute"?Number(object.style.top.replace("px","")):0;
              if(object.offsetWidth + left < Screen.clientDimensions[0] && object.offsetHeight + top < Screen.clientDimensions[1] && (previous < last || !lastTooBig)) {
                object.style.fontSize = String(previous) + "px";
                if(object.offsetWidth + left > Screen.clientDimensions[0] || object.offsetHeight + top > Screen.clientDimensions[1]) {
                  object.style.fontSize = String(last) + "px";
                  lastTooBig = true;
                } else {
                  last = previous;
                  if(lastTooBig) lastTooBig = false;
                }
              }
              if(index === ticks) {
                if(callback instanceof Function) callback();
              } else {
                if(partialCallback instanceof Function) partialCallback();
              }
          },index*(1000 / Graphics.FramesPerSecond)));
      })(index);
  }
  return function() {
    calls.forEach(function(call) {
      clearTimeout(call);
    });
  }
}

// ----------------------------------------------

function recolor(time,oldcolor,newcolor,partialCallback,callback) {
    var calls = [],
        ticks = Math.round(time / (1000 / Graphics.FramesPerSecond)),
        transition = new colorTransition(oldcolor, newcolor),
        previous;
    for(var index = 1; index <= ticks; index++) {
    if(previous !== (previous = transition.calc(index / ticks))) (function(index, color){
            calls.push(setTimeout(function() {
                if(partialCallback instanceof Function) partialCallback(color);
                if(index === ticks && callback instanceof Function) callback();
            }, index * (1000 / Graphics.FramesPerSecond)));
        })(index, previous);
    else if(ticks === index && callback instanceof Function)
      calls.push(setTimeout(callback, index*(1000 / Graphics.FramesPerSecond)));
    }
    return function() {
      calls.forEach(function(call) {
        clearTimeout(call);
      });
    }
}


// ----------------------------------------------

function resize(object,time,oldwidth,oldheight,newwidth,newheight,regardWindow,callback) {
  var calls = [];
  if(regardWindow) {
      if(oldwidth > Body.clientWidth) {
          oldheight = Math.round(((Body.clientWidth) / oldwidth) * oldheight);
          oldwidth = Math.round(body.clientWidth);
      }
      if(newwidth > Body.clientWidth) {
          newheight = Math.round(((Body.clientWidth) / newwidth) * newheight);
          newwidth = Math.round(Body.clientWidth);
      }
  }
  var ticks = Math.round(time / (1000 / Graphics.FramesPerSecond));
  var delta = [newwidth - oldwidth, newheight - oldheight];
  var diff = [delta[0] / ticks, delta[1] / ticks];
  var previous = [false,false];
  for(var index = 0; index <= ticks; index++) {
  if(previous[0] !== (index === ticks?newwidth:Math.round(oldwidth+diff[0]*index))
  || previous[1] !== (index === ticks?newheight:Math.round(oldheight+diff[1]*index))) (function(index){
          calls.push(setTimeout(function(){
              previous = [(index === ticks?newwidth:Math.round(oldwidth+diff[0]*index)),(index === ticks?newheight:Math.round(oldheight+diff[1]*index))];
              object.style.width = String(previous[0]) + "px";
              object.style.height = String(previous[1]) + "px";
              if(index === ticks && callback instanceof Function) callback();
          },index*(1000 / Graphics.FramesPerSecond)));
      })(index);
  }
  return function() {
    calls.forEach(function(call) {
      clearTimeout(call);
    });
  }
}

// ----------------------------------------------

function size(object,width,height,regardWindowWidth, regardWindowHeight) {
  if(!(object instanceof Object)) object = document.getElementById(object);
  if(!object) if(callback instanceof Function) callback();
  if(regardWindowWidth && width > Body.clientWidth) {
      height = Math.round(((Body.clientWidth) / width) * height);
      width = Math.round(Body.clientWidth);
  }
  if(regardWindowHeight && height > Body.clientHeight) {
      width = Math.round(((Body.clientHeight) / height) * width);
      height = Body.clientHeight;
  }
  object.style.width = String(Math.round(width))+"px";
  object.style.height = String(Math.round(height))+"px";
}

// ----------------------------------------------

function retransparent(object,time,transparency_start,transparency_end,callback,dontChangeVisibility) {
  var calls = [];
  var ticks = Math.round(time / (1000 / Graphics.FramesPerSecond));
  var delta = transparency_end - transparency_start;
  var diff = delta / ticks;
  var previous = false;
  for(var index = 0; index <= ticks; index++) {
    if(Math.floor(transparency_start+(index*diff)) !== previous || index === ticks) {
      (function(index){
        calls.push(setTimeout(function() {
          var opacity;
          if(index === ticks) opacity = transparency_end;
          else opacity = transparency_start+(index*diff);
          setOpacity(object, opacity, dontChangeVisibility);
          if(index === ticks && callback instanceof Function) callback();
        },index*(1000 / Graphics.FramesPerSecond)));
      })(index);
      previous = Math.floor(transparency_start+(index*diff));
    }
  }
  return function() {
    calls.forEach(function(call) {
      clearTimeout(call);
    });
  }
}

// ----------------------------------------------
