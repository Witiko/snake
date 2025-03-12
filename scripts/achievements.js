/*

Achievements()
  .attach() - you provide an Achievement, or an Array of Achievements as the first argument
  .detach() - you detach all the attached Achievements
  .reset() - you provide an Achievement, or an Array of Achievements as the first argument, all the current Achievements are detached first
  .check() - you provide a keyWord as the first argument, this keyWord will be passed to Achievement condition and callback functions

Achievement
  count - Boolean - provides the condition and callback functions with second Boolean argument called count and a third argument changeCountValue, these arguments have two functionalities:
    if .repeat === true, it increases its value by one on every callback function call
    if .repeat === false, it will serve as a private object you can use to manually count in the condition function to decide when
      the callback function will be called.
  repeat - Boolean - if enabled, callback can be called countless times, otherwise it will fire only once
  allowedKeyWords - an Array of keyWords values / a keyWord value based on which will be determined whether or not the condition function will be called, false = all keyWords allowed
  allowedKeyWordTypes - an Array of keyWords types / a keyWord type based on which will be determined whether or not the condition function will be called, false = all keyWord types allowed
  condition(keyWord[, Number count[, Function changeCountValue(Number NewValue)]]) - this function has to return true / false. If it returns true, the callback function is called. If undefined, the callback function is called.
  callback(keyWord[, Number count[, Function changeCountValue(Number NewValue)]]) - this function is called when the conditions set by the condition function are met

*/

function Achievements() {
  var array = [], prepare = function(object) {
    object.repeat = object.repeat?1:0;
    if(object.count) {
      var callback = object.callback;
      var count = 0;
      object.callback = function(keyWord) {
        if(object.repeat === 1) count++;
        callback(keyWord, count, function(value){
          count = value;
        });
      }
      var condition = object.condition;
      object.condition = function(keyWord) {
        return condition(keyWord, count, function(value){
          count = value;
        });
      }
    }
    array.push(object);
  }
  this.attach = function(achievement) {
    if(typeof achievement!== "object") return;
    var object;
    if(achievement.length) {
      for(var counter = 0; counter < achievement.length; counter ++) {
        if(achievement[counter].count !== null && achievement[counter].repeat !== null && achievement[counter].callback) {
          object = {
            count: achievement[counter].count,
            repeat: achievement[counter].repeat,
            allowedKeyWords: achievement[counter].allowedKeyWords,
            allowedKeyWordTypes: achievement[counter].allowedKeyWordTypes,
            condition: achievement[counter].condition,
            callback: achievement[counter].callback
          };
          prepare(object);
        }
      }
    } else {
      if(achievement.count === null || achievement.repeat === null || !achievement.callback) return;
      object = {
        count: achievement[counter].count,
        repeat: achievement[counter].repeat,
        allowedKeyWords: achievement[counter].allowedKeyWords,
        allowedKeyWordTypes: achievement[counter].allowedKeyWordTypes,
        condition: achievement[counter].condition,
        callback: achievement[counter].callback
      };
      prepare(object);
    }
  }
  this.detach = function() {
    array = [];
  }
  this.reset =  function(achievement) {
    this.detach();
    this.attach(achievement);
  }
  this.check = function(keyWord) {
    array.each(function(entry) {
      if(entry.repeat >= 0 && (((entry.allowedKeyWords instanceof Array && entry.allowedKeyWords.indexOf(keyWord) !== -1) ||
            entry.allowedKeyWords === keyWord) || ((entry.allowedKeyWordTypes instanceof Array && entry.allowedKeyWordTypes.indexOf(typeof entry) !== -1) ||
            entry.allowedKeyWordTypes === typeof keyWord)) && ((entry.condition && entry.condition(keyWord)) || !entry.condition)) {
              if(entry.repeat === 0) entry.repeat--;
              entry.callback(keyWord);
            }
    });
  }
}