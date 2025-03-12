var Language = function(defaultLang, langArrays) {
  var lang;
  this.negotiateLang = function() {
    if(navigator.systemLanguage && langArrays[navigator.systemLanguage.split("-")[0]]) {
      lang = navigator.systemLanguage.split("-")[0];
    } else if(navigator.language && langArrays[navigator.language.split("-")[0]]) {
      lang = navigator.language.split("-")[0];
    } else lang = defaultLang;
    return true;
  }
  this.setLang = function(l) {
    if(!l || !langArrays[l]) return false;
    lang = l; return true;
  }
  this.getLang = function() {
    if(!lang || !langArrays[lang]) return false;
    return {
      "language" : lang,
      "array" : langArrays[lang]
    };
  }
}