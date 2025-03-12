var Language = function() {
  var lang = null;
  this.negotiateLang = function() {
    if(!this.defaultLang) return false;
    if(navigator.systemLanguage && this.langArrays[navigator.systemLanguage.split("-")[0]]) {
      lang = navigator.systemLanguage.split("-")[0];
    } else if(navigator.language && this.langArrays[navigator.language.split("-")[0]]) {
      lang = navigator.language.split("-")[0];
    } else lang = this.defaultLang;
    return true;
  }
  this.setLang = function(l) {
    if(!this.defaultLang || !this.langArrays || !l || !this.langArrays[l]) return false;
    lang = l; return true;
  }
  this.getLang = function() {
    if(!this.defaultLang || !lang || !this.langArrays || !this.langArrays[lang]) return false;
    return {
      "language" : lang,
      "array" : this.langArrays[lang]
    };
  }
}