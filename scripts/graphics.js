function rotate(objectID,time,startDeg,finalDeg,callback) {
  if(typeof objectID != "object") objectID = document.getElementById(objectID);
  if(!objectID) {
      if(typeof callback == "function") callback();
      return function() {}
  }
  var calls = [];
  var ticks = Math.round(time / (1000 / FramesPerSecond));
  var delta = finalDeg - startDeg;
  var diff = delta / ticks;
  for(var index = 0; index <= ticks; index++) {
    (function(index){
        calls.push(window.setTimeout(function(){
            var result = index==ticks?finalDeg:startDeg+diff*index;
            setAngle(objectID, result);
            if(index == ticks && typeof callback == "function") callback();
        },index*(1000 / FramesPerSecond)));
    })(index);
  }
  return function() {
    for(var count = 0; count < calls.length; count++) {
      clearTimeout(calls[count]);
    }
  }
}

// ----------------------------------------------

function move(objectID,time,x,y,x2,y2,regardWindow,callback) {
  if(typeof objectID != "object") objectID = document.getElementById(objectID);
  if(!objectID) {
      if(typeof callback == "function") callback();
      return function() {}
  }
  if(objectID.style.position != "absolute") objectID.style.position = "absolute";
  var calls = [];
  var ticks = Math.round(time / (1000 / FramesPerSecond));
  var delta = [x2 - x, y2 - y];
  var diff = [delta[0] / ticks, delta[1] / ticks];
  var previous = [false,false];
  for(var index = 0; index <= ticks; index++) {
    if(previous[0] !== (index == ticks?x2:Math.round(x+diff[0]*index))
    || previous[1] !== (index == ticks?y2:Math.round(y+diff[1]*index))) (function(index){
        calls.push(window.setTimeout(function(){
            if(index == ticks) {
              previous = [x2,y2];
            } else {
              previous = [Math.round(x+diff[0]*index),Math.round(y+diff[1]*index)];
              if(regardWindow) {
                if(previous[0] + objectID.offsetWidth + ScrollBarWidth > Screen.clientDimensions[0]) {
                  previous[0] = Screen.clientDimensions[0] - objectID.offsetWidth - ScrollBarWidth - (TextShadows?3:0);
                } else if(previous[0] < 0) {
                  previous[0] = 0;
                } if(previous[1] + objectID.offsetHeight > Screen.clientDimensions[1]) {
                  previous[1] = Screen.clientDimensions[1] - objectID.offsetHeight - (TextShadows?3:0);
                } else if(previous[1] < 0) {
                  previous[1] = 0;
                }
              }
            }
            objectID.style.left = String(previous[0]) + "px";
            objectID.style.top = String(previous[1]) + "px";
            if(index == ticks && typeof callback == "function") callback();
        },index*(1000 / FramesPerSecond)));
    })(index);
  }
  return function() {
    for(var count = 0; count < calls.length; count++) {
      clearTimeout(calls[count]);
    }
  }
}

// ----------------------------------------------

function textMove(objectID,time,x,y,x2,y2,shadow,regardWindow,callback) {
  if(typeof objectID != "object") objectID = document.getElementById(objectID);
  if(!objectID) {
      if(typeof callback == "function") callback();
      return function() {}
  }
  if(objectID.style.position != "absolute") objectID.style.position = "absolute";
  var calls = [];
  var ticks = Math.round(time / (1000 / FramesPerSecond));
  var delta = [x2 - x, y2 - y];
  var diff = [delta[0] / ticks, delta[1] / ticks];
  var previous = [false,false];
  for(var index = 0; index <= ticks; index++) {
    if(previous[0] !== (index == ticks?x2:Math.round(x+diff[0]*index))
    || previous[1] !== (index == ticks?y2:Math.round(y+diff[1]*index))) (function(index){
        calls.push(window.setTimeout(function(){
            if(index == ticks) {
              previous = [x2,y2];
            } else {
              previous = [Math.round(x+diff[0]*index),Math.round(y+diff[1]*index)];
              if(regardWindow) {
                if(previous[0] + objectID.offsetWidth + ScrollBarWidth + (shadow?shadow:0) > Screen.clientDimensions[0]) {
                  previous[0] = Screen.clientDimensions[0] - objectID.offsetWidth - ScrollBarWidth - (shadow?shadow:0);
                } else if(previous[0] < (shadow?shadow:0)) {
                  previous[0] = shadow?shadow:0;
                } if(previous[1] + objectID.offsetHeight + (shadow?shadow:0) > Screen.clientDimensions[1]) {
                  previous[1] = Screen.clientDimensions[1] - objectID.offsetHeight - (shadow?shadow:0);
                } else if(previous[1] < (shadow?shadow:0)) {
                  previous[1] = shadow?shadow:0;
                }
              }
            }
            objectID.style.left = String(previous[0]) + "px";
            objectID.style.top = String(previous[1]) + "px";
            if(index == ticks && typeof callback == "function") callback();
        },index*(1000 / FramesPerSecond)));
    })(index);
  }
  return function() {
    for(var count = 0; count < calls.length; count++) {
      clearTimeout(calls[count]);
    }
  }
}

// ----------------------------------------------

function textResize(objectID,time,oldsize,newsize,partialCallback,callback) {
    if(typeof objectID != "object") objectID = document.getElementById(objectID);
    if(!objectID) {
      if(typeof callback == "function") callback();
      return function() {}
    }
    var calls = [];
    var ticks = Math.round(time / (1000 / FramesPerSecond));
    var delta = newsize - oldsize;
    var diff = delta / ticks;
    var last = 0;
    var lastTooBig = false;
    var previous = false;
    for(var index = 0; index <= ticks; index++) {
    if(previous !== (index == ticks?newsize:Math.round(oldsize+diff*index))) (function(index){
            calls.push(window.setTimeout(function(){
                previous = index == ticks?newsize:Math.round(oldsize+diff*index);
                var left = objectID.style.position=="absolute"?Number(objectID.style.left.replace("px","")):0;
                var top = objectID.style.position=="absolute"?Number(objectID.style.top.replace("px","")):0;
                if(objectID.offsetWidth + left < Screen.clientDimensions[0] - ScrollBarWidth && objectID.offsetHeight + top < Screen.clientDimensions[1] && (previous < last || !lastTooBig)) {
                  objectID.style.fontSize = String(previous) + "px";
                  if(objectID.offsetWidth + left > Screen.clientDimensions[0] - ScrollBarWidth || objectID.offsetHeight + top > Screen.clientDimensions[1]) {
                    objectID.style.fontSize = String(last) + "px";
                    lastTooBig = true;
                  } else {
                    last = previous;
                    if(lastTooBig) lastTooBig = false;
                  }
                }
                if(index == ticks) {
                  if(typeof callback == "function") callback();
                } else {
                  if(partialCallback && typeof partialCallback == "function") partialCallback();
                }
            },index*(1000 / FramesPerSecond)));
        })(index);
    }
    return function() {
      for(var count = 0; count < calls.length; count++) {
        clearTimeout(calls[count]);
      }
    }
}

// ----------------------------------------------

function recolor(time,oldcolor,newcolor,partialCallback,callback) {
    var calls = [];
    var ticks = Math.round(time / (1000 / FramesPerSecond));
    oldcolor = [Number(parseInt(oldcolor.substr(1,2),16).toString(10)),Number(parseInt(oldcolor.substr(3,2),16).toString(10)),Number(parseInt(oldcolor.substr(5,2),16).toString(10))];
    newcolor = [Number(parseInt(newcolor.substr(1,2),16).toString(10)),Number(parseInt(newcolor.substr(3,2),16).toString(10)),Number(parseInt(newcolor.substr(5,2),16).toString(10))];
    var delta = [newcolor[0] - oldcolor[0], newcolor[1] - oldcolor[1], newcolor[2] - oldcolor[2]];
    var diff = [delta[0] / ticks, delta[1] / ticks, delta[2] / ticks];
    var previous = [false,false,false];
    for(var index = 0; index <= ticks; index++) {
    if(previous[0] !== (index < ticks?Math.round(oldcolor[0]+diff[0]*index):newcolor[0])
    || previous[1] !== (index < ticks?Math.round(oldcolor[1]+diff[1]*index):newcolor[1])
    || previous[2] !== (index < ticks?Math.round(oldcolor[2]+diff[2]*index):newcolor[2])) (function(index){
            calls.push(window.setTimeout(function(){
                if(index < ticks) previous = [Math.round(oldcolor[0]+diff[0]*index),Math.round(oldcolor[1]+diff[1]*index),Math.round(oldcolor[2]+diff[2]*index)];
                else previous = [newcolor[0],newcolor[1],newcolor[2]];
                var color = [parseInt(Math.round(previous[0]),10).toString(16),parseInt(Math.round(previous[1]),10).toString(16),parseInt(Math.round(previous[2]),10).toString(16)];
                for(var count=0; count < color.length; count++) {
                  if(color[count].length == 1) color[count] = "0" + String(color[count]);
                }
                if(partialCallback && typeof partialCallback == "function") partialCallback("#" + color.join(""));
                if(index == ticks && typeof callback == "function") callback();
            },index*(1000 / FramesPerSecond)));
        })(index);
    }
    return function() {
      for(var count = 0; count < calls.length; count++) {
        clearTimeout(calls[count]);
      }
    }
}


// ----------------------------------------------

function resize(objectID,time,oldwidth,oldheight,newwidth,newheight,regardWindow,callback) {
    if(typeof objectID != "object") objectID = document.getElementById(objectID);
    if(!objectID) {
      if(typeof callback == "function") callback();
      return function() {}
    }
    var body = document.body || document.documentElement;
    var calls = [];
    if(regardWindow) {
        if(oldwidth > body.clientWidth-ScrollBarWidth) {
            oldheight = Math.round(((body.clientWidth-ScrollBarWidth) / oldwidth) * oldheight);
            oldwidth = Math.round(body.clientWidth-ScrollBarWidth);
        }
        if(newwidth > body.clientWidth-ScrollBarWidth) {
            newheight = Math.round(((body.clientWidth-ScrollBarWidth) / newwidth) * newheight);
            newwidth = Math.round(body.clientWidth-ScrollBarWidth);
        }
    }
    var ticks = Math.round(time / (1000 / FramesPerSecond));
    var delta = [newwidth - oldwidth, newheight - oldheight];
    var diff = [delta[0] / ticks, delta[1] / ticks];
    var previous = [false,false];
    for(var index = 0; index <= ticks; index++) {
    if(previous[0] !== (index == ticks?newwidth:Math.round(oldwidth+diff[0]*index))
    || previous[1] !== (index == ticks?newheight:Math.round(oldheight+diff[1]*index))) (function(index){
            calls.push(window.setTimeout(function(){
                previous = [(index == ticks?newwidth:Math.round(oldwidth+diff[0]*index)),(index == ticks?newheight:Math.round(oldheight+diff[1]*index))];
                objectID.style.width = String(previous[0]) + "px";
                objectID.style.height = String(previous[1]) + "px";
                if(index == ticks && typeof callback == "function") callback();
            },index*(1000 / FramesPerSecond)));
        })(index);
    }
    return function() {
      for(var count = 0; count < calls.length; count++) {
        clearTimeout(calls[count]);
      }
    }
}

// ----------------------------------------------

function size(objectID,width,height,regardWindowWidth, regardWindowHeight) {
    if(typeof objectID != "object") objectID = document.getElementById(objectID);
    if(!objectID) if(typeof callback == "function") callback();
    var body = document.body || document.documentElement;
    if(regardWindowWidth && width > body.clientWidth-ScrollBarWidth) {
        height = Math.round(((body.clientWidth-ScrollBarWidth) / width) * height);
        width = Math.round(body.clientWidth-ScrollBarWidth);
    }
    if(regardWindowHeight && height > body.clientHeight) {
        width = Math.round(((body.clientHeight) / height) * width);
        height = body.clientHeight;
    }
    objectID.style.width = String(Math.round(width))+"px";
    objectID.style.height = String(Math.round(height))+"px";
}

// ----------------------------------------------

function retransparent(objectID,time,transparency_start,transparency_end,callback) {
  if(typeof objectID != "object") objectID = document.getElementById(objectID);
  if(!objectID) {
      if(typeof callback == "function") callback();
      return function() {}
    }
  var calls = [];
  var ticks = Math.round(time / (1000 / FramesPerSecond));
  var delta = transparency_end - transparency_start;
  var diff = delta / ticks;
  var previous;
  if(PerformanceSaver) previous = false;
  for(var index = 0; index <= ticks; index++) {
    if(!PerformanceSaver || Math.floor(transparency_start+(index*diff)) !== previous || index == ticks) {
      (function(index){
        calls.push(window.setTimeout(function() {
          var opacity;
          if(index == ticks) opacity = transparency_end;
          else opacity = transparency_start+(index*diff);
          if(opacity > 0) {
            setOpacity(objectID, opacity);
          } else {
            cover(objectID);
          }
          if(index == ticks && typeof callback == "function") {callback();}
        },index*(1000 / FramesPerSecond)));
      })(index);
      if(PerformanceSaver) previous = Math.floor(transparency_start+(index*diff));
    }
  }
  return function() {
    for(var count = 0; count < calls.length; count++) {
      clearTimeout(calls[count]);
    }
  }
}

// ----------------------------------------------
