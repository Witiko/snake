var DayTime = (function() {
  var DAWN = 0,   // Function flags
      DUSK = 1,
      DAY = 0,    // Status flags
      NIGHT = 1;

  var DayTime = function(latitude, longitude) {
    if(latitude  === undefined ||
       longitude === undefined)
    throw new Error("Define both the latitude and longitude!");
    this.latitude = latitude;
    this.longitude = longitude;
    this._private = {
      listeners: [],
      events: [],
      eventsExistant: []
    };
    var now = Date.now(),
        current = [
          this.get(DAWN),
          this.get(DUSK)
        ],
        that = this,
        eventListener;
    current[0] = current[0] instanceof Date?current[0].getTime():-Infinity;
    current[1] = current[1] instanceof Date?current[1].getTime(): Infinity;
         if(now > current[1])                     this.now = NIGHT;
    else if(now < current[1] && now > current[0]) this.now = DAY;
    else if(now < current[0])                     this.now = NIGHT;
    (eventListener = function() {
      var Event = that.closestEvent();
      if (Event !== false)
        setTimeout(function() {
          that._private.listeners.forEach(function(listener) {
            listener(Event[0]);
          });
          switch(Event[0]) {
            case DAWN: that.now = DAY;   break;
            case DUSK: that.now = NIGHT; break;
          }
          eventListener();
        }, Event[1]);
    })();
  };

  DayTime.DAWN  = DAWN;
  DayTime.DUSK  = DUSK;
  DayTime.DAY   = DAY;
  DayTime.NIGHT = NIGHT;

  DayTime.prototype.toString = function() {
    return this.now === NIGHT?"Night":"Day";
  };

  DayTime.prototype.get = function(flag, suppliedDate) {
    if(flag === undefined) throw "Provide the function flag!";
    var date = suppliedDate || new Date;
    if(flag in this._private.events && this._private.events[flag].getDate() === date.getDate())
      return this._private.eventsExistant[flag]?this._private.events[flag]:false;
    var latitude = this.latitude,
        longitude = this.longitude,
        zenith = 90 + 50/60,        // 90deg 50'
        month = date.getMonth() + 1,
        year = date.getYear(),
        day = date.getDate(),
        dayOfYear = (275 * month / 9).floor() - (
                        ((month + 9) / 12).floor() *
                        (1 + ((year - 4 * (year / 4).floor() + 2) / 3).floor())
                    ) + day - 30,
        longitudeHours = longitude / 15,
        time = dayOfYear + (((flag === DAWN?6:18)  - longitudeHours) / 24),
        sunMeanAnomaly = (0.9856 * time) - 3.289,
        sunLongitude = (sunMeanAnomaly + (1.916 * sunMeanAnomaly.degToRad().sin()) + (0.020 * (2 * sunMeanAnomaly.degToRad()).sin()) + 282.634).degAdjust(),
        sunRightAscension = (function() {
            var RA = (0.91764 * sunLongitude.degToRad().tan()).atan().radToDeg().degAdjust(),
                LQuadrant = (sunLongitude/90).floor() * 90,
                RAQuadrant = (RA/90).floor() * 90;
            return (RA + (LQuadrant - RAQuadrant)) / 15;
        })(),
        sunSinDeclination = 0.39782 * sunLongitude.degToRad().sin(),
        sunCosDeclination = sunSinDeclination.asin().cos(),
        sunLocalHourAngle = (zenith.degToRad().cos() - (sunSinDeclination * latitude.degToRad().sin())) / (sunCosDeclination * latitude.degToRad().cos()),
        hours, localMeanTime, localTime, UTC, dateObject, dateData;
    if((sunLocalHourAngle >  1 && flag === DAWN) ||
       (sunLocalHourAngle < -1 && flag === DUSK)) {
         this._private.eventsExistant[flag] = false;
         return !(this._private.events[flag] = date);
       }
    hours = (flag === DAWN?
      360 - sunLocalHourAngle.acos().radToDeg():
      sunLocalHourAngle.acos().radToDeg()) / 15;
    localMeanTime = hours + sunRightAscension - (0.06571 * time) - 6.622;
    UTC = localMeanTime - longitudeHours;
    if(UTC <   0) UTC = UTC % 24 + 24;
    if(UTC >= 24) UTC %= 24;
    localTime = UTC - date.getTimezoneOffset() / 60;
    dateData = {};
    dateData.hours    = localTime.floor();
    dateData.minutes  = ((localTime - dateData.hours) * 60).floor();
    dateData.seconds  = ((localTime - dateData.hours - dateData.minutes / 60) * 3600).floor();
    dateData.mseconds = ((localTime - dateData.hours - dateData.minutes / 60 - dateData.seconds / 3600) * 3600000).floor();
    dateObject = new Date(date);
    dateObject.setHours(dateData.hours);
    dateObject.setMinutes(dateData.minutes);
    dateObject.setSeconds(dateData.seconds);
    dateObject.setMilliseconds(dateData.mseconds);
    this._private.eventsExistant[flag] = true;
    return (this._private.events[flag] = dateObject);
  };

  DayTime.prototype.listen = function(f) {
    if(f instanceof Function)
      this._private.listeners.push(f);
  };

  DayTime.prototype.stopListening = function(f) {
    this._private.listeners.removeByValue(f);
  };

  DayTime.prototype.closestEvent = function() {
    var now = Date.now(),
        tomorrow,
        current = [
          this.get(DAWN),
          this.get(DUSK)
        ];
    current[0] = current[0] instanceof Date?current[0].getTime():-Infinity;
    current[1] = current[1] instanceof Date?current[1].getTime():-Infinity;
    if(now < current[0]) return [DAWN, current[0] - now];
    if(now < current[1]) return [DUSK, current[1] - now];
    tomorrow = new Date();
    tomorrow.setTime(
      now + 86400000
    );
    current = [
      this.get(DAWN, tomorrow),
      this.get(DUSK, tomorrow)
    ];
    current[0] = current[0] instanceof Date?current[0].getTime():-Infinity;
    current[1] = current[1] instanceof Date?current[1].getTime():-Infinity;
    if(now < current[0]) return [DAWN, current[0] - now];
    if(now < current[1]) return [DUSK, current[1] - now];
    return false;
  };

  return DayTime;
})();