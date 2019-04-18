/**
 * @fileoverview JSON reporter
 * @author Burak Yigit Kaya aka BYK
 */
"use strict";

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (results) {
  return JSON.stringify(results);
};

;;
module.exports = exports.default;
