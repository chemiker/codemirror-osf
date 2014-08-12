// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("osf", function() {
  var header_is_parsed = false;

  var UNIXtimestamp = new RegExp("(\\d+){10}", "i");
  var timestamp = new RegExp("(\\d+){2}:(\\d+){2}:(\\d+){2}", "i");
  var timestamp_micro = new RegExp("(\\d+){2}:(\\d+){2}:(\\d+){2}.(\\d+)", "i");
  var categories = new RegExp("#chapter|#topic|#video|#audio|#image|#quote|#shopping|#prediction|#glosarry|#revision|#link", "i");
  var categories_short = new RegExp("#c|#t|#v|#a|#i|#q|#r", "i");

  function tokenBase(stream, state) {

    if (stream.match(categories) || stream.match(categories_short)){
        return 'keyword';
    }

    if (stream.match(UNIXtimestamp) || stream.match(timestamp_micro) || stream.match(timestamp)){
        return 'variable-3';
    }

    var ch = stream.next();
    if (ch == "#" ) {
      console.log(stream);
      if ( ! stream.skipTo(' ') )
        stream.skipToEnd();
      return "meta";
    }
    if (ch == "\\" ) {
      stream.skipTo(' ');
      return;
    }
    if ( ch == '<' ) {
      state.tokenize = tokenString( '>' );
      return state.tokenize(stream, state);
    }

    // Checking for Header Part
    while ( stream.string ) {
      if ( stream.string == 'HEADER' ) {
        header_is_parsed = true;
      }
      if ( stream.string == '/HEADER' ) {
        header_is_parsed = false;
        stream.next();
        return "header";
      }
      if ( header_is_parsed ) {
       stream.next();
       return "header";
      }
      stream.next();

      return null;
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) {
            end = true;
            break;
        }
        escaped = !escaped && next == "\\";
      }
      if (end || !escaped) state.tokenize = null;
      return "link";
    };
  }

  // Interface

  return {
    startState: function() {
      return {tokenize: null};
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style == "comment" || style == "meta") return style;
      return style;
    }
  };
});

CodeMirror.defineMIME("text/x-osf", "osf");

});
