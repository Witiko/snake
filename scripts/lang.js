var Language = function() {
  var lang = null;
  this.presumeLang = function() {
    if(!this.supportedLangs || !this.defaultLang) return false;
    if(navigator.systemLanguage && this.supportedLangs[navigator.systemLanguage]) {
      lang = navigator.systemLanguage;
    } else if(navigator.language && this.supportedLangs[navigator.language]) {
      lang = navigator.language;
    } else lang = this.defaultLang;
    return true;
  }
  this.setLang = function(l) {
    if(!this.supportedLangs || !this.defaultLang || !this.langArrays || !l || !this.supportedLangs[l]|| !this.langArrays[this.supportedLangs[l]]) return false;
    lang = l; return true;
  }
  this.getLang = function() {
    if(!this.supportedLangs || !this.defaultLang || !lang || !this.langArrays || !this.langArrays[this.supportedLangs[lang]]) return false;
    return {
      "language" : lang,
      "array" : this.langArrays[this.supportedLangs[lang]]
    };
  }
}