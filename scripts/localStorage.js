/*

Usage:
  !storage
    If localStorage === undefined, then none of the technologies
    used to fake the storage is available.

  storage.how [String] - Global Storage / User Data / Cookies
    The technology used to emulate the Storage, not defined in the
    native Storage interface implementation.

  storage.key [Function]
  storage.length [Number]
  storage.clear [Function]
  storage.getItem [Function]
  storage.setItem [Function]
  storage.removeItem [Function]
    The same interface as the original implementation.

  For apparent problems caused by the lack of a standardized way of setting
  setters, getters, deleters and a way of making certain object properties
  enumerable, the stored items cannot be reached by simple localStorage.name.
  You need to use the localStorage methods to manipulate the items (which is
  advised anyways as for example Mozilla 3.X doesn't recognise the above
  mentioned way of item manipulation). The enumerability issues also make it
  impossible to browse the items via the for(variable in object) cycle. You
  need to browse the items using the length property and the key function.


*/

var storage = (function() {
  if(!window.localStorage &&
     ((window.globalStorage &&
       (function() {
          try{
            return globalStorage[location.hostname];
          } catch(e) {return false}
        })())
      || userData
      || cookie)
    )
  return (function() {
    var keys = [],
        index = 0,
        currentStorage,
        object;
    if(window.globalStorage &&
      (function() {
        try{
          return globalStorage[location.hostname];
        } catch(e) {
          return false;
        }
      })()
    ) {
      currentStorage = globalStorage[location.hostname];
      object = {
        length: currentStorage.length,
        getItem: function(item) {
          return currentStorage[item]?currentStorage[item].value:undefined;
        },
        setItem: function(item, value) {
          currentStorage[item] = value;
          object.length = currentStorage.length;
          keys.push(item);
        },
        removeItem: function(item) {
          delete currentStorage[item];
          object.length = currentStorage.length;
          keys.removeByValue(item);
        },
        clear: function() {
          keys.forEach(function(item) {
            delete currentStorage[item];
          });
          keys.length = object.length = 0;
        },
        key: function(index) {
          return keys[index];
        },
        how: "Global storage"
      };
      for(var item in currentStorage) {
        keys[index++] = item.value;
      }
    } else if(userData) {
      object = {
        length: userData.length,
        getItem: function(item) {
          return userData.load[item];
        },
        setItem: function(item, value) {
          userData.save(item, value);
          object.length = userData.length;
          keys.push(item);
        },
        removeItem: function(item) {
          userData.erase(item);
          object.length = userData.length;
          keys.removeByValue(item);
        },
        clear: function() {
          keys.forEach(function(item) {
            userData.erase(item);
          });
          keys.length = object.length = 0;
        },
        key: function(index) {
          return keys[index];
        },
        how: "User data"
      };
      for(var item in userData.load) {
        keys[index++] = item;
      }
    } else if(cookie) {
      object = {
        length: cookie.length,
        getItem: function(item) {
          return cookie.load[item];
        },
        setItem: function(item, value) {
          cookie.save(item, value);
          object.length = cookie.length;
          keys.push(item);
        },
        removeItem: function(item) {
          cookie.erase(item);
          object.length = cookie.length;
          keys.removeByValue(item);
        },
        clear: function() {
          keys.forEach(function(item) {
            cookie.erase(item);
          });
          keys.length = object.length = 0;
        },
        key: function(index) {
          return keys[index];
        },
        how: "Cookies"
      };
      for(var item in cookie.load) {
        keys[index++] = item;
      }
    }
    return object;
  })(); else if(window.localStorage) return localStorage;
})();
