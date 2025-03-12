/*

Usage:
  Global Object / Boolean false cookie
    cookie.save(name, data);
    cookie.load[name];
    cookie.erase(name);
    cookie.length

*/

var cookie = (navigator.cookieEnabled && (function(){
  var text = Date.now?Date.now():new Date().getTime(),
      current = new Date(),
      expired = new Date();
  current.setTime(text + 3155692597470);
  current = current.toUTCString();
  expired.setTime(text - 1);
  expired = expired.toUTCString();
  document.cookie = text + "=" + text + ";expires=" + current + ";domain=" + location.hostname + ";path=/";
  var returnValue = !!document.cookie.match('(^|;) ?' + text + '=([^;]*)(;|$)');
  document.cookie = text + "=" + text + ";expires=" + expired + ";domain=" + location.hostname + ";path=/";
  return returnValue;
})())?(function() {
  var text = new Date().getTime(),
      current = new Date(),
      expired = new Date(),
      loaded = {}, length = 0;
  current.setTime(text + 3155692597470);
  current = current.toUTCString();
  expired.setTime(text - 1);
  expired = expired.toUTCString();
  return {
    save : function(name, data) {
      document.cookie = name + "=" + data + ";expires=" + current + ";domain=" + location.hostname + ";path=/";
      if(!(name in cookie.load))
        cookie.length++;
      cookie.load[name] = data;
      return !!document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    },
    erase : function(name) {
      if(!(name in cookie.load)) return false;
      document.cookie = name + "=" + name + ";expires=" + expired + ";domain=" + location.hostname + ";path=/";
      delete cookie.load[name];
      cookie.length--;
      return !document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    },
    load : (function(){
      var split = document.cookie.split(";"),
          processing;
      for(var i = 0, l = split.length; i < l; i++) {
        processing = split[i].split("=");
        loaded[processing[0]] = processing[1];
        length++;
      }
      return loaded;
    })(),
    length : length
  }
})():false;
