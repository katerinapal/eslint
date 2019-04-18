/**
 * @fileoverview Rule to flag when a function has too many parameters
 * @author Ilya Volodin
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
            description: "enforce a maximum number of parameters in function definitions",
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

        var option = context.options[0];
        var numParams = 3;

        if ((typeof option === "undefined" ? "undefined" : _typeof(option)) === "object" && option.hasOwnProperty("maximum") && typeof option.maximum === "number") {
            numParams = option.maximum;
        }
        if ((typeof option === "undefined" ? "undefined" : _typeof(option)) === "object" && option.hasOwnProperty("max") && typeof option.max === "number") {
            numParams = option.max;
        }
        if (typeof option === "number") {
            numParams = option;
        }

        /**
         * Checks a function to see if it has too many parameters.
         * @param {ASTNode} node The node to check.
         * @returns {void}
         * @private
         */
        function checkFunction(node) {
            if (node.params.length > numParams) {
                context.report(node, "This function has too many parameters ({{count}}). Maximum allowed is {{max}}.", {
                    count: node.params.length,
                    max: numParams
                });
            }
        }

        return {
            FunctionDeclaration: checkFunction,
            ArrowFunctionExpression: checkFunction,
            FunctionExpression: checkFunction
        };
    }
};
;
module.exports = exports.default;
