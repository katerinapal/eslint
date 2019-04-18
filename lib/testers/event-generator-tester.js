/**
 * @fileoverview Helpers to test EventGenerator interface.
 * @author Toru Nagashima
 */
"use strict";

/* global describe, it */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var assert = require("assert");

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

exports.default = {

    /**
     * Overrideable `describe` function to test.
     * @param {string} text - A description.
     * @param {Function} method - A test logic.
     * @returns {any} The returned value with the test logic.
     */
    describe: typeof describe === "function" ? describe : /* istanbul ignore next */function (text, method) {
        return method.apply(this);
    },

    /**
     * Overrideable `it` function to test.
     * @param {string} text - A description.
     * @param {Function} method - A test logic.
     * @returns {any} The returned value with the test logic.
     */
    it: typeof it === "function" ? it : /* istanbul ignore next */function (text, method) {
        return method.apply(this);
    },

    /**
     * Does some tests to check a given object implements the EventGenerator interface.
     * @param {Object} instance - An object to check.
     * @returns {void}
     */
    testEventGeneratorInterface: function testEventGeneratorInterface(instance) {
        this.describe("should implement EventGenerator interface", function () {
            this.it("should have `emitter` property.", function () {
                assert.equal(_typeof(instance.emitter), "object");
                assert.equal(_typeof(instance.emitter.emit), "function");
            });

            this.it("should have `enterNode` property.", function () {
                assert.equal(_typeof(instance.enterNode), "function");
            });

            this.it("should have `leaveNode` property.", function () {
                assert.equal(_typeof(instance.leaveNode), "function");
            });
        }.bind(this));
    }
};
;
module.exports = exports.default;
