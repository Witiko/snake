/*

Usage:
  Object Screen, you can attach function onload to it. The method will fire when DOM is loaded ant the object is ready to use.
    clientDimensions = [viewport Width, viewport Height]
    contentDimensions = [page Width, page Height]
    scrolledContent = [scrolled Width, scrolled Height]

*/

var Screen = {};
if(!window.addEventListener) {
  window.attachEvent("onload", function(){
    var body = document.body || document.getElementsByTagName("body")[0],
        html = document.documentElement || document.getElementsByTagName("html")[0],
        getClosest = function(key, valueOne, valueTwo) {
          return Math.min(Math.abs(key - valueOne), Math.abs(key - valueTwo))==0?valueOne:valueTwo;
        },
        getFarthest = function(key, valueOne, valueTwo) {
          return Math.max(Math.abs(key - valueOne), Math.abs(key - valueTwo))==0?valueOne:valueTwo;
        };
    Screen.clientDimensions = [
      getClosest(screen.availWidth, html.clientWidth, body.clientWidth),
      getClosest(screen.availHeight, html.clientHeight, body.clientHeight)
    ];
    Screen.contentDimensions = [
      getFarthest(screen.availWidth, html.scrollWidth, body.scrollWidth),
      getFarthest(screen.availHeight, html.scrollHeight, body.scrollHeight)
    ];
    Screen.scrolledContent = [
      html.scrollLeft > 0?html.scrollLeft:body.scrollLeft,
      html.scrollTop > 0?html.scrollTop:body.scrollTop
    ];
    window.attachEvent("onscroll", function(){
      Screen.scrolledContent[0] = html.scrollLeft > 0?html.scrollLeft:body.scrollLeft;
      Screen.scrolledContent[1] = html.scrollTop > 0?html.scrollTop:body.scrollTop;
    });
    window.attachEvent("onresize", function(){
      Screen.clientDimensions[0] = getClosest(screen.availWidth, html.clientWidth, body.clientWidth);
      Screen.clientDimensions[1] = getClosest(screen.availHeight, html.clientHeight, body.clientHeight);
      Screen.contentDimensions[0] = getFarthest(screen.availWidth, html.scrollWidth, body.scrollWidth);
      Screen.contentDimensions[1] = getFarthest(screen.availHeight, html.scrollHeight, body.scrollHeight);
      Screen.scrolledContent[0] = html.scrollLeft > 0?html.scrollLeft:body.scrollLeft;
      Screen.scrolledContent[1] = html.scrollTop > 0?html.scrollTop:body.scrollTop;
    });
    if(typeof Screen.onload == "function") {
      Screen.onload();
      delete Screen.onload;
    }
  });
} else {
  window.addEventListener("load", function() {
    var body = document.body || document.getElementsByTagName("body")[0],
        html = document.documentElement || document.getElementsByTagName("html")[0],
        getClosest = function(key, valueOne, valueTwo) {
          return Math.min(Math.abs(key - valueOne), Math.abs(key - valueTwo))==0?valueOne:valueTwo;
        },
        getFarthest = function(key, valueOne, valueTwo) {
          return Math.max(Math.abs(key - valueOne), Math.abs(key - valueTwo))==0?valueOne:valueTwo;
        };
    Screen.clientDimensions = [
      getClosest(screen.availWidth, html.clientWidth, body.clientWidth),
      getClosest(screen.availHeight, html.clientHeight, body.clientHeight)
    ];
    Screen.contentDimensions = [
      getFarthest(screen.availWidth, html.scrollWidth, body.scrollWidth),
      getFarthest(screen.availHeight, html.scrollHeight, body.scrollHeight)
    ];
    Screen.scrolledContent = [
      html.scrollLeft > 0?html.scrollLeft:body.scrollLeft,
      html.scrollTop > 0?html.scrollTop:body.scrollTop
    ];
    window.addEventListener("scroll", function(){
      Screen.scrolledContent[0] = html.scrollLeft > 0?html.scrollLeft:body.scrollLeft;
      Screen.scrolledContent[1] = html.scrollTop > 0?html.scrollTop:body.scrollTop;
    }, false);
    window.addEventListener("resize", function(){
      Screen.clientDimensions[0] = getClosest(screen.availWidth, html.clientWidth, body.clientWidth);
      Screen.clientDimensions[1] = getClosest(screen.availHeight, html.clientHeight, body.clientHeight);
      Screen.contentDimensions[0] = getFarthest(screen.availWidth, html.scrollWidth, body.scrollWidth);
      Screen.contentDimensions[1] = getFarthest(screen.availHeight, html.scrollHeight, body.scrollHeight);
      Screen.scrolledContent[0] = html.scrollLeft > 0?html.scrollLeft:body.scrollLeft;
      Screen.scrolledContent[1] = html.scrollTop > 0?html.scrollTop:body.scrollTop;
    }, false);
    if(typeof Screen.onload == "function") {
      Screen.onload();
      delete Screen.onload;
    }
  }, false);
}
