/**
 * @fileoverview Defining the hashing function in one place.
 * @author Michael Ficarra
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hash;
var murmur = require("imurmurhash");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

/**
 * hash the given string
 * @param  {string} str the string to hash
 * @returns {string}    the hash
 */
function hash(str) {
  return murmur(str).result().toString(36);
}
module.exports = exports.default;
