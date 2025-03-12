var Skin = (function() {
  var style;

  var Skin = function(style) {
    this.style = style;
  }

  Skin.Transition = function(oldSkin, newSkin, duration, callback) {
    var rules,
        ticks = Math.round(duration / (1000 / Graphics.FramesPerSecond)),
        colorTransitions = {
          originalGridColor: new colorTransition(oldSkin.style.originalGridColor, newSkin.style.originalGridColor),
          originalBackgroundColor: new colorTransition(oldSkin.style.originalBackgroundColor, newSkin.style.originalBackgroundColor),
          originalCellColor: new colorTransition(oldSkin.style.originalCellColor, newSkin.style.originalCellColor),
          originalHeadColor: new colorTransition(oldSkin.style.originalHeadColor, newSkin.style.originalHeadColor),
          originalBodyColor: new colorTransition(oldSkin.style.originalBodyColor, newSkin.style.originalBodyColor),
          foodColors: [
            new colorTransition(oldSkin.style.foodColors[0], newSkin.style.foodColors[0]),
            new colorTransition(oldSkin.style.foodColors[1], newSkin.style.foodColors[1]),
            new colorTransition(oldSkin.style.foodColors[2], newSkin.style.foodColors[2]),
            new colorTransition(oldSkin.style.foodColors[3], newSkin.style.foodColors[3])
          ]
        };
    veilColor = newSkin.style.veilColor;
    originalGridColor = newSkin.style.originalGridColor;
    originalBackgroundColor = newSkin.style.originalBackgroundColor;
    originalCellColor = newSkin.style.originalCellColor;
    speedColors = newSkin.style.speedColors;
    foodColors = newSkin.style.foodColors;
    scoreColors = newSkin.style.scoreColors;
    starsImage = newSkin.style.starsImage;
    GUI.updateColors();
    stars.each(function(star) {
      star.src = starsImage[SVGSupport?1:0];
    });
    for(var index = 1; index <= ticks; index++) {
      (function(index) {
        setTimeout(function() {
          while(style.hasChildNodes()) {
            style.removeChild(style.firstChild);
          }
          var rules = document.createTextNode(
            "body {background-color: " + colorTransitions.originalBackgroundColor.calc(index / ticks) + "}" +
            ".gameField {background-color: " + colorTransitions.originalGridColor.calc(index / ticks) + ";}" +
            ".nic {background-color: " + colorTransitions.originalCellColor.calc(index / ticks) + "}" +
            "." + food + " {background-color: " + colorTransitions.foodColors[foodColorIndexes[food]].calc(index / ticks) + "}" +
            "." + bonusFood + " {background-color: " + colorTransitions.foodColors[foodColorIndexes[bonusFood]].calc(index / ticks) + "}" +
            "." + superFood + " {background-color: " + colorTransitions.foodColors[foodColorIndexes[superFood]].calc(index / ticks) + "}" +
            "." + legendFood + " {background-color: " + colorTransitions.foodColors[foodColorIndexes[legendFood]].calc(index / ticks) + "}" +
            ".hlava {background-color: " + colorTransitions.originalHeadColor.calc(index / ticks) + "}" +
            ".telo {background-color: " + colorTransitions.originalBodyColor.calc(index / ticks) + "}"
          );
          if(style.styleSheet)
            style.styleSheet.cssText = rules.nodeValue;
          else
            style.appendChild(rules);
          if(index === ticks && typeof callback === "function")
            callback();
        }, index * (1000 / Graphics.FramesPerSecond));
      })(index);
    }
  }

  Skin.prototype.ApplyTextVariables = function() { // Use before the Skin.Transition
    gridColors = this.style.gridColors;
    textColors = this.style.textColors;
    sTextColors = this.style.sTextColors;
  }

  Skin.prototype.Apply = function() {
    var append, rules;
    scoreColors = this.style.scoreColors;
    starsImage = this.style.starsImage;
    veilColor = this.style.veilColor;
    originalGridColor = this.style.originalGridColor;
    originalBackgroundColor = this.style.originalBackgroundColor;
    originalCellColor = this.style.originalCellColor;
    gridColors = this.style.gridColors;
    textColors = this.style.textColors;
    speedColors = this.style.speedColors;
    sTextColors = this.style.sTextColors;
    foodColors = this.style.foodColors;
    GUI.updateColors();
    stars.each(function(star) {
      star.src = starsImage[SVGSupport?1:0];
    });
    if(typeof style === "undefined") {
      append = true;
      style = document.createElement("style");
      style.type = "text/css";
    } else {
      while(style.hasChildNodes()) {
        style.removeChild(style.firstChild);
      }
    }
    rules = document.createTextNode(
      "body {background-color: " + originalBackgroundColor + "}" +
      ".gameField {background-color: " + originalGridColor + ";}" +
      ".nic {background-color: " + originalCellColor + "}" +
      "." + food + " {background-color: " + foodColors[foodColorIndexes[food]] + "}" +
      "." + bonusFood + " {background-color: " + foodColors[foodColorIndexes[bonusFood]] + "}" +
      "." + superFood + " {background-color: " + foodColors[foodColorIndexes[superFood]] + "}" +
      "." + legendFood + " {background-color: " + foodColors[foodColorIndexes[legendFood]] + "}" +
      ".hlava {background-color: " + this.style.originalHeadColor + "}" +
      ".telo {background-color: " + this.style.originalBodyColor + "}"
    );
    if(style.styleSheet)
      style.styleSheet.cssText = rules.nodeValue;
    else
      style.appendChild(rules);
    if(append === true)
      Head.appendChild(style);
  }

  return Skin;
})()