var ScalingSystem = (function(){
  var currentState = 0,
      help = {
        increase: scalingSystemVars[0],
        decrease: scalingSystemVars[1]
      },
      skill = {
        increase: scalingSystemVars[2],
        decrease: scalingSystemVars[3]
      }, that =
  {
    reset: function() {
      currentState = 0;
    },
    set: function(what, howMuch) {
      howMuch = howMuch || 1;
      var coeff = speedCoeff[2]();
      switch(what) {
        case HELP:
          if(currentState > 0) {
            if(currentState > skill.decrease * howMuch * coeff)
              currentState -= skill.decrease * howMuch * coeff;
            else
              currentState = 0;
          } else {
            if(-currentState + help.increase * howMuch * coeff < 10)
              currentState -= help.increase * howMuch * coeff;
            else
              currentState = -10;
          }
          break;
        case SKILL:
          if(currentState < 0) {
            if(-currentState > help.decrease * howMuch * 1 / coeff)
              currentState += help.decrease * howMuch * 1 / coeff;
            else
              currentState = 0;
          } else {
            if(currentState + skill.increase * howMuch * 1 / coeff < 10)
              currentState += skill.increase * howMuch * 1 / coeff;
            else
              currentState = 10;
          }
      }
      // For testing purposes only
      // console.log("currentState: " + currentState);
      return currentState;
    },
    get: function(what) {
      return what === SKILL?
        (currentState > 0? currentState:0):
            (what === HELP?
        (currentState < 0?-currentState:0):
            currentState);
    }
  };
  return that;
})(),HELP = 0,SKILL = 1;