// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
// 
// CodeMirror OSF Version 1.0
// Author: Alexander Lüken
// 
// Codemirror OSF does syntax highlighting for the OSF Shownotes Format.
// It is based on the CodeMirror FORTRAN mode.

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
  var headerIsParsed = false;

  // Fetch timestamps (UNIX, HH:MM:SS and HH:MM:SS.mmm)
  // It is likely, that only one RegExp is needed here.
  var timestampUNIX = new RegExp("(\\d+){10}", "i");
  var timestamp = new RegExp("(\\d+){2}:(\\d+){2}:(\\d+){2}", "i");
  var timestampMicro = new RegExp("(\\d+){2}:(\\d+){2}:(\\d+){2}.(\\d+)", "i");
  // RegExp for Categories
  var categories = new RegExp("(#chapter\\s)|(#topic\\s)|(#video\\s)|(#audio\\s)|(#image\\s)|(#quote\\s)|(#shopping\\s)|(#prediction\\s)|(#glosarry\\s)|(#revision\\s)|(#link\\s)|(#chapter$)|(#topic$)|(#video$)|(#audio$)|(#image$)|(#quote$)|(#shopping$)|(#prediction$)|(#glosarry$)|(#revision$)|(#link$)", "i");
  var categoriesShort = new RegExp("(#c\\s)|(#t\\s)|(#v\\s)|(#a\\s)|(#i\\s)|(#q\\s)|(#r\\s)|(#c$)|(#t$)|(#v$)|(#a$)|(#i$)|(#q$)|(#r$)", "i");

  function tokenBase(stream, state) {
    if ( headerIsParsed == false ) {
      // Timestamps
      if ( stream.match(timestampUNIX) || stream.match(timestampMicro) || stream.match(timestamp) ){
          return 'variable-3';
      }
      // Categories
      if ( stream.match(categories) || stream.match(categoriesShort) ){
          return 'keyword';
      }
      // Tags
      var ch = stream.next();
      if ( ch == "#" ) {
        if ( ! stream.skipTo(' ') )
          stream.skipToEnd();
        return "meta";
      }
      // If a \ is present the current word is escaped. Skip to the next white-space char.
      if ( ch == "\\" ) {
        stream.skipTo(' ');
        return;
      }
      // Links
      if ( ch == '<' ) {
        state.tokenize = tokenLink( '>' );
        return state.tokenize(stream, state);
      }
    }

    // Header
    while ( stream.string ) {
      if ( stream.string == 'HEADER' ) {
        headerIsParsed = true;
      }
      if ( stream.string == '/HEADER' ) {
        headerIsParsed = false;
        stream.next();
        return "header";
      }
      if ( headerIsParsed ) {
       stream.next();
       return "header";
      }
      stream.next();

      return;
    }
  }

  function tokenLink( token ) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == token && !escaped) {
            end = true;
            break;
        }
        escaped = !escaped && next == "\\";
      }
      if (end || !escaped) state.tokenize = null;
      return "link";
    };
  }

  return {
    startState: function() {
      return {tokenize: null};
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = (state.tokenize || tokenBase)(stream, state);
      return style;
    }
  };
});

CodeMirror.defineMIME("text/x-osf", "osf");

});
