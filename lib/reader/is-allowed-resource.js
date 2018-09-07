var hasProtocol = require('../utils/has-protocol');

var HTTP_PROTOCOL = 'http:';

function isAllowedResource(uri, isRemote, rules) {
  var normalizedRule;
  var x;

  if (isRemote && !hasProtocol(uri)) {
    uri = HTTP_PROTOCOL + uri;
  }

    /***
     1) whitelist  uri === rule
     2) blacklist  "!"+uri === rule
     3) match partial paths
     4) match partial negated paths
     3)  is the resource local?
       a) yes --  whitelist "local" === rule
       b) no
     4) whitelist uri.hostname === rule
     5) blacklist uri.hostname === !rule
     6) whitelist "remote" === rule
     ***/


    /**
     * MATCHING EXACT RULE TO URI
     */
  if(rules.indexOf(uri)!== -1){
    return true;
  } else if (rules.indexOf("!" + uri) !== -1) {
      return false;
  }

    /**
     * MATCHING PATH TO URI
     */

  for(x = 0; x< rules.length; ++x){
      if(rules[x][0] == "!"){
          normalizedRule = rules[x].substring(1);
          if(uri.indexOf(normalizedRule)!= -1){
              return false;
          }
      } else {
          if(uri.indexOf(rules[x])!= -1){
              return true;
          }
      }
  }

    /**
     * CHECK THAT GENERIC RULE TYPE LOCAL / REMOTE IS ALLOWED
     */
  if(isRemote && rules.indexOf("remote")  !== -1){
    return true;
  } else if (!isRemote && rules.indexOf("local") !== -1){
    return true;
  } else if(rules.indexOf("all") !== -1){
    return true;
  } else if (rules.indexOf("none") !== -1){
    return false;
  } else if (rules.indexOf("!remote") && isRemote){
    return false;
  } else if (rules.indexOf("!local") && !isRemote){
    return false;
  }
    /***
     * OTHERWISE RETURN FALSE;
     */
  return false;
}

module.exports = isAllowedResource;
