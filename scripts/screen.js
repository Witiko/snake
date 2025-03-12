/*

Usage:
  Attributes:
   Screen.clientDimensions = [viewport Width, viewport Height]
   Screen.contentDimensions = [page Width, page Height]
   Screen.scrolledContent = [scrolled Width, scrolled Height]
   Screen.loaded = true / false

  Methods:
   Screen.now - updates the aforementioned attributes.
    Those are normally updated when the window.onresize
    and window.onscroll events fire, yet by changing the
    content dynamically you may face a situation when
    the attributes are off. And as I don't fancy mindless
    updating in fixed intervals, I implemented this function.
    Returns true / false depending on whether or not any
    of the values were altered.

   Screen.DOMLoaded - by placing it at the end of your (X)HTML file
    you quicken the loading of the library as it won't wait for the
    page, but merely for the DOM structure to load.

  Events:
   Screen.onload - fires as soon as the Screen library is loaded
    and ready to use.

   Screen.onresize - fires on window.onresize. Unlike
    with the aforementioned event, with this event you have
    always the certainty that the values of the Screen object
    attributes have already been updated. Returns the former
    screen size values as an object {clientDimensions: Array,
    contentDimensions: Array} as the first attribute and
    true / false invokedByUser value depending on if the event was
    invoked because of the Screen.now() call as the second attribute.

   Screen.onscroll - fires on window.onscroll. Unlike
    with the aforementioned event, with this event you have
    always the certainty that the values of the Screen object
    attributes have already been updated. Returns the former
    scrolled content size in pixels as the first attribute and
    true / false invokedByUser value depending on if the event was
    invoked because of the Screen.now() call as the second attribute.

  You can attach your functions directly to the onload attribute or
  use the addEventListener / attachEvent methods instead.

*/

var Screen = (function() {
  var loadQueue = [],
      resizeQueue = [],
      scrollQueue = [],
      attachListener = window.addEventListener?addEventListener:attachEvent,
      detachListener = window.removeEventListener?removeEventListener:detachEvent,
      libraryBody = function() {
        that.loaded = true;
        var body = document.body || document.getElementsByTagName("body")[0],
            html = document.documentElement || document.getElementsByTagName("html")[0],
            getClosest = function(key, valueOne, valueTwo) {
              var abs = [Math.abs(key - valueOne), Math.abs(key - valueTwo)];
              return abs.indexOf(Math.min.apply(Math, abs));
            },
            getFarthest = function(key, valueOne, valueTwo) {
              var abs = [Math.abs(key - valueOne), Math.abs(key - valueTwo)];
              return abs.indexOf(Math.max.apply(Math, abs));
            },
            newThread = function(f) {
              setTimeout(f, 0);
            },
            baseElements = {
              viewport: "innerWidth" in window && "innerHeight" in window?window:[
                getClosest(screen.availWidth, html.clientWidth, body.clientWidth)?body:html,
                getClosest(screen.availHeight, html.clientHeight, body.clientHeight)?body:html
              ],
              content: [
                getFarthest(screen.availWidth, html.scrollWidth, body.scrollWidth)?body:html,
                getFarthest(screen.availHeight, html.scrollHeight, body.scrollHeight)?body:html
              ]
            };
        Screen.clientDimensions = [
          baseElements.viewport === window?window.innerWidth:baseElements.viewport[0].clientWidth,
          baseElements.viewport === window?window.innerHeight:baseElements.viewport[1].clientHeight
        ];
        Screen.contentDimensions = [
          baseElements.content[0].scrollWidth,
          baseElements.content[1].scrollHeight
        ];
        Screen.scrolledContent = [
          html.scrollLeft > 0?html.scrollLeft:body.scrollLeft,
          html.scrollTop > 0?html.scrollTop:body.scrollTop
        ];
        Screen.now = function(invokedByUser) {
          var resized = false, scrolled = false, formerSizeValues = {
            clientDimensions : Screen.clientDimensions.slice(0),
            contentDimensions : Screen.contentDimensions.slice(0)
          }, formerScrolledContent = Screen.scrolledContent.slice(0);
          if(Screen.clientDimensions[0] !==
            (Screen.clientDimensions[0] = baseElements.viewport === window?window.innerWidth:baseElements.viewport[0].clientWidth))
            resized = true;
          if(Screen.clientDimensions[1] !==
            (Screen.clientDimensions[1] = baseElements.viewport === window?window.innerHeight:baseElements.viewport[1].clientHeight) &&
            !resized)
            resized = true;
          if(Screen.contentDimensions[0] !==
            (Screen.contentDimensions[0] = baseElements.content[0].scrollWidth) &&
            !resized)
            resized = true;
          if(Screen.contentDimensions[1] !==
            (Screen.contentDimensions[1] = baseElements.content[1].scrollHeight) &&
            !resized)
            resized = true;
          if(Screen.scrolledContent[0] !==
            (Screen.scrolledContent[0] = html.scrollLeft > 0?html.scrollLeft:body.scrollLeft) &&
            !scrolled)
            scrolled = true;
          if(Screen.scrolledContent[1] !==
            (Screen.scrolledContent[1] = html.scrollTop > 0?html.scrollTop:body.scrollTop) &&
            !scrolled)
            scrolled = true;
          if(resized) {
            if(Screen.onresize instanceof Function) newThread(function(){
              Screen.onresize(formerSizeValues, !invokedByUser);
            });
            resizeQueue.each(function(field) {
              newThread(function() {
                field(formerSizeValues, !invokedByUser);
              });
            });
          }
          if(scrolled) {
            if(Screen.onscroll instanceof Function) newThread(function(){
              Screen.onscroll(formerScrolledContent, !invokedByUser);
            });
            scrollQueue.each(function(field) {
              newThread(function() {
                field(formerScrolledContent, !invokedByUser);
              });
            })
          }
          return scrolled || resized;
        }
        attachListener((window.addEventListener?"":"on")+"scroll", function(){
          if(Screen.onscroll instanceof Function || scrollQueue.length)
            var formerScrolledContent = Screen.scrolledContent.slice(0);
          Screen.scrolledContent[0] = html.scrollLeft > 0?html.scrollLeft:body.scrollLeft;
          Screen.scrolledContent[1] = html.scrollTop > 0?html.scrollTop:body.scrollTop;
          if(Screen.onscroll instanceof Function) newThread(function(){
            Screen.onscroll(formerScrolledContent, false);
          });
          scrollQueue.each(function(field) {
            newThread(function() {
              field(formerScrolledContent, false);
            });
          });
        }, false);
        attachListener((window.addEventListener?"":"on")+"resize", function() {
          Screen.now(true);
        }, false);
        if(Screen.onload instanceof Function) {
          Screen.onload();
          delete Screen.onload;
        }
        loadQueue.each(function(func) {
          newThread(func);
        });
      }, that;
  attachListener((window.addEventListener?"":"on")+"load", libraryBody, false);
  return (that = {
    loaded: false,
    DOMLoaded : function() {
      if(!that.loaded) {
        detachListener((window.removeEventListener?"":"on")+"load", libraryBody, false);
        libraryBody();
      }
    },
    addEventListener : function(name, listener) {
      switch(name) {
        case "load": if(!that.loaded) loadQueue.push(listener); return !that.loaded;
        case "resize": resizeQueue.push(listener); return true;
        case "scroll": scrollQueue.push(listener); return true;
        default: return false;
      }
    },
    removeEventListener : function(name, listener) {
      var array = (function() {switch(name) {
        case "load": return loadQueue;
        case "resize": resizeQueue;
        case "scroll": scrollQueue;
        default: return false;
      }})(),
      success = false;
      if(!array) return false;
      array.each(function(field, index) {
        if(field === listener) {
          array.remove(index);
          success = true;
        }
      });
      return success;
    },
    attachEvent : function(name, listener) {
      switch(name) {
        case "onload": if(!that.loaded) loadQueue.push(listener); return !that.loaded;
        case "onresize": resizeQueue.push(listener); return true;
        case "onscroll": scrollQueue.push(listener); return true;
        default: return false;
      }
    },
    detachEvent : function(name, listener) {
      var array = (function() {switch(name) {
        case "onload": return loadQueue;
        case "onresize": resizeQueue;
        case "onscroll": scrollQueue;
        default: return false;
      }})(),
      success = false;
      if(!array) return false;
      array.each(function(field, index) {
        if(field === listener) {
          array.remove(index);
          success = true;
        }
      });
      return success;
    }
  });
})();
