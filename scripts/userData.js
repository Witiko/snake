/*

Usage:
  Global Object / Boolean false userData
    userData.save(name, data);
    userData.load[name];
    userData.erase(name);
    userData.length

*/

var userData = ((document.documentElement || document.getElementsByTagName("html")[0]).addBehavior)?(function() {
  var userDataElement = document.documentElement || document.getElementsByTagName("html")[0],
      loaded = {}, prefix = "userData_", list, length = 0;
  userDataElement.addBehavior("#default#userData");
  userDataElement.load("userData");
  return {
    save : function(name, data) {
      if(!userData.load[name]) {
        userData.length++;
        list.push(name);
      }
      userData.load[name] = data;
      userDataElement.load(prefix + name);
      userDataElement.setAttribute("userData", data);
      userDataElement.save(prefix + name);
      userDataElement.load("userData");
      userDataElement.setAttribute("list", list.join(";"));
      userDataElement.save("userData");
      return true;
    },
    erase : function(name) {
      if(!userData.load[name]) return false;
      list.removeByValue(name);
      userData.length--;
      delete userData.load[name];
      userDataElement.load(prefix + name);
      userDataElement.removeAttribute("userData");
      userDataElement.save(prefix + name);
      userDataElement.load("userData");
      userDataElement.setAttribute("list", list.join(";"));
      userDataElement.save("userData");
      return true;
    },
    load : (function() {
      list = userDataElement.getAttribute("list");
      if(typeof list !== "string") {
        list = [];
      } else {
        list = list.split(";");
        for(var i = 0, l = list.length; i < l; i++) {
          userDataElement.load(prefix + list[i]);
          loaded[list[i]] = userDataElement.getAttribute("userData");
          length++;
          userDataElement.load("userData");
        }
      }
      return loaded;
    })(),
    length : length
  }
})():false;
