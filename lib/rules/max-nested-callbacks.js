/**
 * @fileoverview Rule to enforce a maximum number of nested callbacks.
 * @author Ian Christian Myers
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
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

exports.default = {
    meta: {
        docs: {
            description: "enforce a maximum depth that callbacks can be nested",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [{
            oneOf: [{
                type: "integer",
                minimum: 0
            }, {
                type: "object",
                properties: {
                    maximum: {
                        type: "integer",
                        minimum: 0
                    },
                    max: {
                        type: "integer",
                        minimum: 0
                    }
                },
                additionalProperties: false
            }]
        }]
    },

    create: function create(context) {

        //--------------------------------------------------------------------------
        // Constants
        //--------------------------------------------------------------------------
        var option = context.options[0];
        var THRESHOLD = 10;

        if ((typeof option === "undefined" ? "undefined" : _typeof(option)) === "object" && option.hasOwnProperty("maximum") && typeof option.maximum === "number") {
            THRESHOLD = option.maximum;
        }
        if ((typeof option === "undefined" ? "undefined" : _typeof(option)) === "object" && option.hasOwnProperty("max") && typeof option.max === "number") {
            THRESHOLD = option.max;
        }
        if (typeof option === "number") {
            THRESHOLD = option;
        }

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        var callbackStack = [];

        /**
         * Checks a given function node for too many callbacks.
         * @param {ASTNode} node The node to check.
         * @returns {void}
         * @private
         */
        function checkFunction(node) {
            var parent = node.parent;

            if (parent.type === "CallExpression") {
                callbackStack.push(node);
            }

            if (callbackStack.length > THRESHOLD) {
                var opts = { num: callbackStack.length, max: THRESHOLD };

                context.report(node, "Too many nested callbacks ({{num}}). Maximum allowed is {{max}}.", opts);
            }
        }

        /**
         * Pops the call stack.
         * @returns {void}
         * @private
         */
        function popStack() {
            callbackStack.pop();
        }

        //--------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------

        return {
            ArrowFunctionExpression: checkFunction,
            "ArrowFunctionExpression:exit": popStack,

            FunctionExpression: checkFunction,
            "FunctionExpression:exit": popStack
        };
    }
};
;
module.exports = exports.default;
