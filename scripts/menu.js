function GUI(settings) {
  if(!(this instanceof GUI))
    return new GUI(settings);
  if(!(settings instanceof Object) ||
     !(settings.createNode instanceof Function))
    throw new Error("Provide the constructor with the createNode function!");
  var that = this,
      node, wrapper;
  this._private = {
    data: {},
    node: undefined,
    show: settings.showNode,
    hide: settings.hideNode,
    hideCall: settings.hideCalled,
    updateColors: settings.updateColors,
    stickyText: {
      animation: undefined,
      wrapper: undefined
    }
  };
  this.status = GUI.HIDDEN;

  // Sticky Text
  node = settings.createNode.call(this, this._private.data);
  wrapper = document.createElement("div");
  wrapper.className = "absolutePositionedText GUI";
  cover(wrapper);
  wrapper.appendChild(node);
  this._private.node = node;
  this._private.stickyText.wrapper = wrapper;

  // Modules init
  if(!this.constructor.instances.length) {
    this.constructor.modules.each(function(module) {
      if(module.enabled)
         module.init(module.data);
    });
  }

  this.constructor.instances.push(this);
};

GUI.HIDDEN = 0;         // State bytemasks
GUI.HIDING = 1;
GUI.APPEARING = 2;
GUI.VISIBLE = 3;
GUI.showingDelay = 500, // Constants
GUI.hidingDelay  = 500,
GUI.instances = [];     // Instances
GUI.updateColors = function() {
  if(!this.instances.length) return;
  var args = arguments;
  this.modules.each(function(module) {
    if(module.enabled && module.static && module.static.updateColors)
       module.static.updateColors.call(GUI, module.data, args);
  });
  this.instances.each(function(GUInst) {
    GUInst.updateColors(args);
  });
};
GUI.show = function(callback, additionalAttributes) {
  if(!this.instances.length) return;
  var length = 0,
      counter = 0,
      listen = function() {
        if(++counter === length &&
          callback instanceof Function)
          callback();
      };
  this.modules.each(function(module) {
    if(module.enabled && module.static && module.static.show)
       module.static.show.call(GUI, module.data, additionalAttributes);
  });
  this.instances.each(function(GUInst) {
    if(GUInst.status !== GUI.VISIBLE) {
      length++;
      GUInst.show(listen, additionalAttributes);
    }
  });
};
GUI.hide = function(callback, additionalAttributes) {
  if(!this.instances.length) return;
  var length = 0,
      counter = 0,
      listen = function() {
        if(++counter === length &&
          callback instanceof Function)
          callback();
      };
  this.modules.each(function(module) {
    if(module.enabled && module.static && module.static.hide)
       module.static.hide.call(GUI, module.data, additionalAttributes);
  });
  this.instances.each(function(GUInst) {
    if(GUInst.status !== GUI.HIDDEN) {
      length++;
      GUInst.hide(listen, additionalAttributes);
    }
  });
};


GUI.prototype.updateColors = function(args) {
  var that = this;
  if(this._private.updateColors instanceof Function)
     this._private.updateColors.call(
       this,
       this._private.node,
       args,
       this._private.data
    );
  GUI.modules.each(function(module) {
    if(module.enabled && module.prototypal && module.prototypal.updateColors)
       module.prototypal.updateColors.call(
         that,
         module.data,
         that._private.node,
         args,
         that._private.data
       );
  });
};
GUI.prototype.show = function(callback, additionalAttributes) {
  if(this.status === GUI.VISIBLE) return;
  var $ = this._private.stickyText, that = this,
      startOpacity = this.status === GUI.HIDING ||
                     this.status === GUI.APPEARING?getOpacity($.wrapper):0,
      delay = GUI.showingDelay * (1 - startOpacity / 100);
  if(this.status === GUI.HIDDEN && this._private.show)
    this._private.show.call(
      this,
      this._private.node,
      additionalAttributes,
      this._private.data
    );
  GUI.modules.each(function(module) {
    if(module.enabled && module.prototypal && module.prototypal.show)
       module.prototypal.show.call(
         that,
         module.data,
         that._private.node,
         additionalAttributes,
         that._private.data
       );
  });
  if(startOpacity === 0)
    canvas.appendChild($.wrapper);
  if($.animation) $.animation();
  this.status = GUI.APPEARING;
  $.wrapper.style.left = String(Screen.clientDimensions[0] / 2 - $.wrapper.offsetWidth / 2) + "px";
  $.wrapper.style.top = String(Screen.clientDimensions[1] / 2 - $.wrapper.offsetHeight / 2) + "px";
  if(Graphics.Transparency)
    $.animation = retransparent($.wrapper, delay, startOpacity, 100, function() {
      delete $.animation;
      that.status = GUI.VISIBLE;
      if(callback instanceof Function)
         callback();
    }); else {
    uncover($.wrapper);
    this.status = GUI.VISIBLE;
    if(callback instanceof Function)
       callback();
  }
};
GUI.prototype.hide = function(callback, additionalAttributes) {
  if(this.status === GUI.HIDDEN) return;
  var $ = this._private.stickyText, that = this,
      startOpacity = this.status === GUI.APPEARING ||
                     this.status === GUI.HIDING?getOpacity($.wrapper):100,
      delay = GUI.hidingDelay * startOpacity / 100,
      finish = function() {
        if(that._private.hide instanceof Function)
           that._private.hide.call(
             that,
             that._private.node,
             additionalAttributes,
             that._private.data
           );
        canvas.removeChild($.wrapper);
      };
  if(this._private.hideCall)
    this._private.hideCall.call(
      this,
      this._private.node,
      additionalAttributes,
      this._private.data
    );
  GUI.modules.each(function(module) {
    if(module.enabled && module.prototypal && module.prototypal.hide)
       module.prototypal.hide.call(
         that,
         module.data,
         that._private.node,
         additionalAttributes,
         that._private.data
       );
  });
  if($.animation) $.animation();
  this.status = GUI.HIDING;
  if(Graphics.Transparency)
    $.animation = retransparent($.wrapper, delay, startOpacity, 0, function() {
      delete $.animation;
      finish();
      that.status = GUI.HIDDEN;
      if(callback instanceof Function)
         callback();
    }); else {
    finish();
    this.status = GUI.HIDDEN;
    if(callback instanceof Function)
       callback();
  }
};

/*
    Definované funkce:
      createNode(data) - Má zde dojít k vytvoøení a navrácení zobrazovaného DOM uzlu

    Volitelné:
      updateColors(node, additionalAttributes, data) - V této funkci musí dojít k update veškerých barev v DOM uzlu
      hideNode(node, additionalAttributes, data) - V této funkci musí dojít k pøerušení pøípadných animací, je volána pøed skrytím DOM uzlu
      hideCalled(node, additionalAttributes, data) - Tato metoda je zavolána pøi zavolání funkce hide, ne pøi skuteèném skrytí.
      showNode(node, additionalAttributes, data) - V této funkci musí dojít k vytvoøení pøípadných animací, je volána pøed zobrazením DOM uzlu

  Pøístupné funkce a atributy prototypu:
    updateColors(... attributes ...) - zavolá funkci updateColors() a pøedá jí zavolané atributy
    show(callback, additionalAttributes) - zobrazí daný DOM uzel a pøedá additionalAttributes funkci showNode
    hide(callback, additionalAttributes) - skryje daný DOM uzel a pøedá additionalAttributes funkci showNode
    status - GUI.HIDDEN / GUI.HIDING / GUI.APPEARING / GUI.VISIBLE - stav GUI

  Pøístupné funkce a atributy konstruktoru:
    updateColors(... attributes ...) - zavolá funkci updateColors() u všech potomkù
    show(callback, additionalAttributes) / hide(callback, additionalAttributes) - zavolá dané funkce u všech potomkù
    instances - pole veškerých potomkù
*/

function ScoreNode() {
  if(!(this instanceof ScoreNode))
    return new ScoreNode;
  var node = document.createDocumentFragment(),
      txt = document.createElement("span"),
      span = document.createElement("span"),
      colors = this.constructor.getScoreColors();
  span[textContent] = (score>=1000?score.group():score);
  span.style.color = colors[0];
  if(Graphics.TextGlowEffects)
    setGlow(span, GlowMagnitude, colors[1]);
  txt[textContent] = l[1];
  txt.style.fontVariant = "small-caps";
  node.appendChild(txt);
  node.appendChild(span);
  this.node = node;
  this.span = span;
};

ScoreNode.prototype.update = function(resetEffects) {
  var colors = this.constructor.getScoreColors();
  this.span[textContent] = (score>=1000?score.group():score);
  this.span.style.color = colors[0];
  if(Graphics.TextGlowEffects)
    setGlow(this.span, GlowMagnitude, colors[1]);
  else if(resetEffects)
    setGlow(this.span, 0, colors[1]);
};

ScoreNode.getScoreColors = function() {
  if(eatenLegendFood) return scoreColors[5];
  if(score <  scoreColorTresholds[0]) return scoreColors[0];
  if(score >= scoreColorTresholds[0] &&
     score <  scoreColorTresholds[1]) return scoreColors[1];
  if(score >= scoreColorTresholds[1] &&
     score <  scoreColorTresholds[2]) return scoreColors[2];
  if(score >= scoreColorTresholds[2] &&
     score <  scoreColorTresholds[3]) return scoreColors[3];
  if(score >= scoreColorTresholds[3] &&
     score <  scoreColorTresholds[4]) return scoreColors[4];
  if(score >= scoreColorTresholds[4] &&
     score < maxScore) return scoreColors[5];
  return scoreColors[6];
};

/*
  Pøístupné funkce a atributy prototypu:
    update(resetEffects) - obnoví text a barvy DOM nodu se skóre, podle argumentu pøípadnì i smaže efekty podle nového nastavení
    node - DOM node se skóre
    span - Span DOM node pøímo se skóre, privátní

  Pøístupné funkce a atributy konstruktoru:
    getScoreColors - navrátí barvy k aktuální hodnotì skóre
*/

GUI.modules = [
  {  // Modul závoje
    enabled: CSSFilters || CSSOpacity,
    data: {
      veil: document.createElement("div"),
      veilOpacity: 40,
      status: GUI.HIDDEN,
      show: function($) {
        if($.status === GUI.VISIBLE) return;
        if(!Graphics.Transparency || !Graphics.Veil || !Graphics.VeilAnimation) {
          $.status = GUI.VISIBLE;
          if(Graphics.Transparency && Graphics.Veil && !Graphics.VeilAnimation)
            setOpacity($.veil, $.veilOpacity);
          return;
        }
        var startOpacity = $.status === GUI.HIDDEN?
              0:getOpacity($.veil),
            delay = GUI.showingDelay * (1 - startOpacity / $.veilOpacity);
        if($.status === GUI.HIDDEN)
          canvas.appendChild($.veil);
        if($.anim) $.anim();
        $.status = GUI.APPEARING;
        $.anim = retransparent($.veil, delay, startOpacity, $.veilOpacity, function() {
          delete $.anim;
          $.status = GUI.VISIBLE;
        });
      },
      hide: function($) {
        if($.status === GUI.HIDDEN) return;
        if(!Graphics.Transparency || !Graphics.Veil || !Graphics.VeilAnimation) {
          $.status = GUI.HIDDEN;
          if(Graphics.Transparency && Graphics.Veil && !Graphics.VeilAnimation)
            cover($.veil);
          return;
        }
        var startOpacity = $.status === GUI.VISIBLE?
              $.veilOpacity:getOpacity($.veil),
            delay = GUI.showingDelay * startOpacity / $.veilOpacity;
        if($.anim) $.anim();
        $.status = GUI.HIDING;
        $.anim = retransparent($.veil, delay, startOpacity, 0, function() {
          delete $.anim;
          canvas.removeChild($.veil);
          $.status = GUI.HIDDEN;
        });
      }
    },
    init: function($) {
      $.veil.className = "veil";
      $.veil.style.backgroundColor = veilColor;
      if(Graphics.Transparency && Graphics.Veil) {
        setOpacity($.veil, $.veilOpacity);
        canvas.appendChild($.veil);
        $.status = GUI.VISIBLE;
      } else {
        cover($.veil);
      }
    },
    static: {
      updateColors: function($, params) {
        var updateColors = params[0];
        $.veil.style.backgroundColor = veilColor;
        if(updateColors) { // If we're updating the stylesheet
          if($.status !== GUI.HIDDEN) { // If the GUI isn't hidden
            if(!Graphics.Transparency || !Graphics.Veil) { // If the graphics option were throttled
              if(covered($.veil)) return; // And this is the first time we trigger the function
              if($.anim) $.anim(); // Stop the animation
              if($.status === GUI.APPEARING) // Serialize the module state
                 $.status = GUI.VISIBLE;
              else if($.status === GUI.HIDING)
                 $.status = GUI.HIDDEN;
              cover($.veil); // Hide the element
              canvas.removeChild($.veil); // And remove it from the document
            } else if(covered($.veil)) { // If the graphics were re-renabled
              setOpacity($.veil, $.veilOpacity); // Make the veil visible
              canvas.appendChild($.veil); // And append it into the document
            } else if(!Graphics.VeilAnimation) { // If the veil animation was disabled
              if($.anim) $.anim(); // Kill the animation
              if($.status !== GUI.VISIBLE) // And if necessary, set the correct opacity
                setOpacity($.veil, $.veilOpacity);
            }
          } else if(Graphics.Transparency && Graphics.Veil) // Else if the graphics were throttled
            cover($.veil); // Make the hidden element invisible
        }
      },
      show: function($) {
        $.show($);
      },
      hide: function($) {
        $.hide($);
      }
    },
    prototypal: {
      show: function($) {
        var length = GUI.instances.length;
        GUI.instances.each(function(GUInst) {
          if(GUInst.status === GUI.HIDDEN ||
             GUInst.status === GUI.HIDING) length--;
        });
        if(!length) $.show($);
      },
      hide: function($) {
        var length = GUI.instances.length;
        GUI.instances.each(function(GUInst) {
          if(GUInst.status === GUI.HIDDEN ||
             GUInst.status === GUI.HIDING) length--;
        });
        if(length === 1) $.hide($);
      }
    }
  }
];

/*
  Moduly rozšiøující základní funkènost knihovny:
    GUI.modules = [
      {
        enabled:         // true / false
        data: Objekt     // Volitelné datové úložištì modulu, pøedáváno jako první argument u funkcí
        init(moduleData) // Metoda volaná po vytvoøení první instance GUI
        static: { // Metody zavolané po volání korespondující statické metody konstruktoru, this odkazuje na GUI
          updateColors(moduleData, additionalAttributes)
          show(moduleData, additionalAttributes)
          hide(moduleData, additionalAttributes)
        },
        prototypal: { // Metody zavolané po volání korespondující metody prototypu, this odkazuje na instanci
          updateColors(moduleData, node, additionalAttributes, data)
          show(moduleData, node, additionalAttributes, data)
          hide(moduleData, node, additionalAttributes, data)
        }
      }
    ]

*/