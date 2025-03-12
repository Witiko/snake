var setOpacity, getOpacity, setGlow, setAngle;

if("\v" == "v") {

  setGlow = function(element, glowStrength, glowColor) {
    if(typeof element != "object" || typeof glowStrength != "number" || glowStrength < 0 || typeof glowColor != "string" || typeof element.style != "object" || element.style.cssText == void(0)) return false;
    if(/progid:\s*DXImageTransform\.Microsoft\.Glow\(color\s*=\s*#\s*[0-9a-fA-F]*\s*,\s*strength\s*=\s*\d*\s*\)/i.test(element.style.filter)) {
      if(glowStrength > 0) {
        element.style.filter = element.style.filter.replace(/(progid:\s*DXImageTransform\.Microsoft\.Glow\(color\s*=\s*)#\s*[0-9a-fA-F]*(\s*,\s*strength\s*=\s*)\d*(\s*\))/i,"$1" + glowColor + "$2" + glowStrength + "$3");
      } else {
        element.style.cssText = element.style.cssText.replace(/(filter:\s*)*progid:\s*DXImageTransform\.Microsoft\.Glow\(color\s*=\s*#\s*[0-9a-fA-F]*\s*,\s*strength\s*=\s*\d*\s*\)/ig,"");
      }
    } else if(glowStrength > 0) {
      element.style.filter += "progid:DXImageTransform.Microsoft.Glow(color = " + glowColor + ", strength = " + glowStrength + ")";
    }
    return true;
  }

  setAngle = function(element, angle) {
    if(typeof element != "object" || typeof angle != "number" || angle > 360 || angle < -360 || typeof element.style != "object" || element.style.cssText == void(0)) return false;
    if(angle == 360 || angle == -360) angle = 0;
    else if(angle>360) angle -= Math.floor(angle/360)*360;
    else if(angle<-360) angle += Math.floor(angle/360)*360;
    if(angle<0) angle = 360+angle;
    angle = Math.round(angle/90);
    if(/progid:\s*DXImageTransform\.Microsoft\.BasicImage\(rotation\s*=\s*\d\s*\)/i.test(element.style.filter)) {
      if(angle > 0) {
        element.style.filter = element.style.filter.replace(/(progid:\s*DXImageTransform\.Microsoft\.BasicImage\(rotation\s*=\s*)\d(\s*\))/i,"$1" + angle + "$2");
      } else {
        element.style.cssText = element.style.cssText.replace(/(filter:\s*)*progid:\s*DXImageTransform\.Microsoft\.BasicImage\(rotation\s*=\s*\d\s*\)/ig,"");
      }
    } else if(angle > 0) {
      element.style.filter += "progid:DXImageTransform.Microsoft.BasicImage(rotation = " + angle + ")";
    }
    return true;
  }

  setOpacity = function(element, opacity) {
    if(typeof element != "object" || typeof opacity != "number" || opacity < 0 || opacity > 100 || typeof element.style != "object" || element.style.cssText == void(0)) return false;
    if(/progid:\s*DXImageTransform\.Microsoft\.Alpha\(opacity\s*=\s*\d*\.*\d*\s*\)/i.test(element.style.filter)) {
      if(opacity > 0) {
        if(element.style.visibility == "hidden")
          element.style.visibility = "visible";
        if(opacity < 100)
          element.style.filter = element.style.filter.replace(/(progid:\s*DXImageTransform\.Microsoft\.Alpha\(opacity\s*=\s*)\d*\.*\d*(\s*\))/i,"$1" + opacity + "$2");
        else
          element.style.cssText = element.style.cssText.replace(/(filter:\s*)*progid:\s*DXImageTransform\.Microsoft\.Alpha\(opacity\s*=\s*\d*\.*\d*\s*\)/ig,"");
      } else {
        element.style.visibility = "hidden";
      }
    } else {
      if(opacity > 0) {
        if(element.style.visibility == "hidden")
          element.style.visibility = "visible";
        if(opacity < 100)
          element.style.filter += "progid:DXImageTransform.Microsoft.Alpha(opacity = " + opacity + ")";
      }
      else if(opacity == 0)
        element.style.visibility = "hidden";
    }
    return true;
  }

  getOpacity = function(element) {
    if(typeof element != "object" || typeof element.style != "object" || element.style.cssText == void(0)) return 100;
    return (Number(element.style.cssText.match(/progid:\s*DXImageTransform\.Microsoft\.Alpha\(opacity\s*=\s*(\d*\.*\d*)\s*\)/i)[1]) || (element.style.visibility == "hidden"?0:100))
  }

} else {

  setAngle = function(element, angle) {
    if(typeof element != "object" || typeof angle != "number" || typeof element.style != "object") return false;
    if(angle == 360 || angle == -360) angle = 0;
    else if(angle>360) angle -= Math.floor(angle/360)*360;
    else if(angle<-360) angle += Math.floor(angle/360)*360;
    if(angle<0) angle = 360+angle;
    if(angle != 0) {
      element.style.transform = "rotate(" + angle + "deg)";
      element.style.WebkitTransform = "rotate(" + angle + "deg)";
      element.style.MozTransform = "rotate(" + angle + "deg)";
      element.style.OTransform = "rotate(" + angle + "deg)";
    } else {
      element.style.transform = "";
      element.style.WebkitTransform = "";
      element.style.MozTransform = "";
      element.style.OTransform = "";
    }
    return true;
  }

  setGlow = function(element, glowStrength, glowColor) {
    if(typeof element != "object" || typeof glowStrength != "number" || glowStrength < 0 || typeof glowColor != "string" || typeof element.style != "object") return false;
    element.style.textShadow = glowColor + " 0px 0px " + glowStrength + "px";
    return true;
  }

  setOpacity = function(element, opacity) {
    if(typeof element != "object" || typeof opacity != "number" || opacity < 0 || opacity > 100 || typeof element.style != "object") return false;
    if(opacity > 0) {
      if(element.style.visibility == "hidden")
        element.style.visibility = "visible";
      element.style.opacity = opacity==100?"":opacity / 100;
    } else {
      element.style.visibility = "hidden";
      if(element.style.opacity) element.style.opacity = "";
    }
    return true;
  }

  getOpacity = function(element) {
    if(typeof element != "object" || typeof element.style != "object") return 100;
    if(element.style.visibility == "hidden") return 0;
    else if(element.style.opacity) return element.style.opacity * 100;
    else return 100;
  }
}

var show = function(element) {
  if(typeof element != "object" || typeof element.style != "object") return false;
  element.style.display = "";
  return true;
}

var hide = function(element) {
  if(typeof element != "object" || typeof element.style != "object") return false;
  element.style.display = "none";
  return true;
}

var cover = function(element) {
  if(typeof element != "object" || typeof element.style != "object") return false;
  element.style.visibility = "hidden";
  return true;
}

var uncover = function(element) {
  if(typeof element != "object" || typeof element.style != "object") return false;
  element.style.visibility = "";
  return true;
}

var shown = function(element) {
  if(typeof element != "object" || typeof element.style != "object") return false;
  return element.style.display != "none" && element.style.display != "hidden";
}

var hidden = function(element) {
  if(typeof element != "object" || typeof element.style != "object") return false;
  return element.style.display == "none";
}

var covered = function(element) {
  if(typeof element != "object" || typeof element.style != "object") return false;
  return element.style.display == "hidden";
}
