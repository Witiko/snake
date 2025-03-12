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
  countTill - Number - Optional attribute relevant in (count && repeat) setting. Sets the ceiling to the execution counter.
  repeat - Boolean - if enabled, callback can be called countless times, otherwise it will fire only once
  allowedKeyWords - an Array of keyWords values / a keyWord value based on which will be determined whether or not the condition function will be called, false = all keyWords allowed
  allowedKeyWordTypes - an Array of keyWords types / a keyWord type based on which will be determined whether or not the condition function will be called, false = all keyWord types allowed
  condition(keyWord[, Number count[, Function changeCountValue(Number NewValue)]]) - this function has to return true / false. If it returns true, the callback function is called. If undefined, the callback function is called.
  callback(keyWord[, Number count[, Function changeCountValue(Number NewValue)]]) - this function is called when the conditions set by the condition function are met.

*/

function Achievements() {
  var array = [], prepare = function(object) {
    object.repeat = object.repeat?1:0;
    if(object.count) {
      var callback = object.callback;
      var count = 0;
      object.callback = function(keyWord) {
        callback(keyWord, count, function(value) {
          count = value;
        });
        if(object.repeat &&
          (object.countTill || Infinity) > count) count++;
      }
      var condition = object.condition;
      object.condition = function(keyWord) {
        return condition(keyWord, count, function(value) {
          count = value;
        });
      }
    }
    array.push(object);
  }
  this.attach = function(achievement) {
    if(!(achievement instanceof Object)) return;
    if(achievement.length) achievement.forEach(preparation);
    else preparation(achievement);
    function preparation(achievement) {
      prepare({
        count: achievement.count,
        countTill: achievement.countTill,
        repeat: achievement.repeat,
        allowedKeyWords: achievement.allowedKeyWords,
        allowedKeyWordTypes: achievement.allowedKeyWordTypes,
        condition: achievement.condition,
        callback: achievement.callback
      });
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
    array.forEach(function(entry) {
      if(entry.repeat >= 0 && (((entry.allowedKeyWords instanceof Array && entry.allowedKeyWords.indexOf(keyWord) !== -1) ||
         entry.allowedKeyWords === keyWord) || ((entry.allowedKeyWordTypes instanceof Array && entry.allowedKeyWordTypes.indexOf(typeof entry) !== -1) ||
         entry.allowedKeyWordTypes === typeof keyWord)) && ((entry.condition && entry.condition(keyWord)) || !entry.condition)) {
           if(entry.repeat === 0) entry.repeat--;
           entry.callback(keyWord);
         }
    });
  }
}