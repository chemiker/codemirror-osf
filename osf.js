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
  function words(array) {
    var keys = {};
    for (var i = 0; i < array.length; ++i) {
      keys[array[i]] = true;
    }
    return keys;
  }

  var categories = words([
                  "abstract", "accept", "allocatable", "allocate",
                  "array", "assign", "asynchronous", "backspace",
                  "bind", "block", "byte", "call", "case",
                  "class", "close", "common", "contains",
                  "continue", "cycle", "data", "deallocate",
                  "decode", "deferred", "dimension", "do",
                  "elemental", "else", "encode", "end",
                  "endif", "entry", "enumerator", "equivalence",
                  "exit", "external", "extrinsic", "final",
                  "forall", "format", "function", "generic",
                  "go", "goto", "if", "implicit", "import", "include",
                  "inquire", "intent", "interface", "intrinsic",
                  "module", "namelist", "non_intrinsic",
                  "non_overridable", "none", "nopass",
                  "nullify", "open", "optional", "options",
                  "parameter", "pass", "pause", "pointer",
                  "print", "private", "program", "protected",
                  "public", "pure", "read", "recursive", "result",
                  "return", "rewind", "save", "select", "sequence",
                  "stop", "subroutine", "target", "then", "to", "type",
                  "use", "value", "volatile", "where", "while",
                  "write"]);

  var header_is_parsed = false;

  var UNIXtimestamp = new RegExp("(\\d+){10}", "i");
  var timestamp = new RegExp("(\\d+){2}:(\\d+){2}:(\\d+){2}", "i");
  var timestamp_micro = new RegExp("(\\d+){2}:(\\d+){2}:(\\d+){2}.(\\d+)", "i");

  function tokenBase(stream, state) {

    if (stream.match(UNIXtimestamp)){
        return 'variable-3';
    }

    if (stream.match(timestamp_micro)){
        return 'variable-3';
    }

    if (stream.match(timestamp)){
        return 'variable-3';
    }

    var ch = stream.next();
    if (ch == "#" ) {
      if ( ! stream.skipTo(' ') )
        stream.skipToEnd();
      return "hr";
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
