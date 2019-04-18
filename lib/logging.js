/**
 * @fileoverview Handle logging for ESLint
 * @author Gyandeep Singh
 */

"use strict";

/* eslint no-console: "off" */

/* istanbul ignore next */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {

    /**
     * Cover for console.log
     * @returns {void}
     */
    info: function info() {
        console.log.apply(console, Array.prototype.slice.call(arguments));
    },

    /**
     * Cover for console.error
     * @returns {void}
     */
    error: function error() {
        console.error.apply(console, Array.prototype.slice.call(arguments));
    }
};
;
module.exports = exports.default;
