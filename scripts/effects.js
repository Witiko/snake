var setOpacity, getOpacity, setGlow, setAngle;

if(CSSFilters && !(CSSTransform && CSSOpacity)) {

  setGlow = function(element, strength, color) {
    var filter = element.style.filter.length === 0?
      false:element.filters["DXImageTransform.Microsoft.Glow"];
    if(filter)
      element.style.filter = element.style.filter.replace(
        /(progid:DXImageTransform\.Microsoft\.Glow\(color=).*(,strength=)\d*(\))/,
        strength > 0?"$1" + color + "$2" + strength + "$3":""
      );
    else if(strength !== 0) {
      element.style.filter += "progid:DXImageTransform.Microsoft.Glow(color=" + color +
                                                                    ",strength=" + strength + ")";
    }
  };

  setAngle = function(element, angle) {
    var sin, cos,
        filter = element.style.filter.length === 0?
          false:element.filters["DXImageTransform.Microsoft.Matrix"];
    angle = angle.degToRad().radAdjust();
    sin = angle.sin();
    cos = angle.cos();
    if(filter) {
      /* Spoèítáme si hodnoty transformace a zaneseme nové hodnoty */
      element.style.filter = element.style.filter.replace(
        /(progid:DXImageTransform\.Microsoft\.Matrix\(M11=)-?.*(,M12=)-?.*(,M21=)-?.*(,M22=)-?.*(,sizingMethod='auto expand'\))/,
        angle !== 0?"$1" + cos + "$2" + (-sin) + "$3" + sin + "$4" + cos + "$5":""
      );
    } else if(angle !== 0) {
      /* Vytvoøíme nový záznam filtru */
      element.style.filter += "progid:DXImageTransform.Microsoft.Matrix(M11=" +   cos  +
                                                                      ",M12=" + (-sin) +
                                                                      ",M21=" +   sin  +
                                                                      ",M22=" +   cos  +
                                                                      ",sizingMethod='auto expand')";
    }
  };

  setOpacity = function(element, opacity, dontChangeVisibility) {
    var filter = element.style.filter.length === 0?
          false:element.filters["DXImageTransform.Microsoft.Alpha"];
    opacity = (+opacity).round();
    if(filter) element.style.filter = element.style.filter.replace(
        /(progid:DXImageTransform\.Microsoft\.Alpha\(opacity=)\d*(\.\d*)?(\))/,
        (dontChangeVisibility || opacity !== 0) && opacity !== 100?"$1" + opacity + "$3":""
      );
    else if((dontChangeVisibility || opacity !== 0) && opacity !== 100)
      element.style.filter += "progid:DXImageTransform.Microsoft.Alpha(opacity=" + opacity + ")";
    if(!dontChangeVisibility) {
      if(opacity) {
        if( covered(element)) uncover(element);
      } else {
        if(!covered(element))   cover(element);
      }
    }
  };

  getOpacity = function(element) {
    return (element.filters["DXImageTransform.Microsoft.Alpha"] && element.filters["DXImageTransform.Microsoft.Alpha"].opacity) || (element.style.visibility == "hidden"?0:100);
  };

} else if(CSSTransform && CSSOpacity) {

  setAngle = function(element, angle) {
    if(angle < 0) angle = angle % 360 + 360
    if(angle >= 360) angle %= 360;
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
  };

  setGlow = function(element, strength, color) {
    if(strength > 0)
      element.style.textShadow = color + " 0px 0px " + strength + "px";
    else element.style.textShadow = "";
  };

  setOpacity = function(element, opacity, dontChangeVisibility) {
    if(dontChangeVisibility || opacity)
      element.style.opacity = opacity === 100?"":opacity / 100;
    if(!dontChangeVisibility) {
      if(opacity) {
        if( covered(element)) uncover(element);
      } else {
        if(!covered(element)) cover(element);
        element.style.opacity = "";
      }
    }
  };

  getOpacity = function(element) {
    if(element.style.visibility == "hidden") return 0;
    else if(element.style.opacity)
      return element.style.opacity * 100;
    else return 100;
  };
}

var show = function(element) {
  element.style.display = "";
  return true;
};

var hide = function(element) {
  element.style.display = "none";
  return true;
};

var cover = function(element) {
  element.style.visibility = "hidden";
  return true;
};

var uncover = function(element) {
  element.style.visibility = "";
  return true;
};

var shown = function(element) {
  return element.style.display !== "none" && element.style.visibility !== "hidden";
};

var hidden = function(element) {
  return element.style.display === "none";
};

var covered = function(element) {
  return element.style.visibility === "hidden";
};
