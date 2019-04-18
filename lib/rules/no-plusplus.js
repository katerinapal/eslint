/**
 * @fileoverview Rule to flag use of unary increment and decrement operators.
 * @author Ian Christian Myers
 * @author Brody McKee (github.com/mrmckeb)
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
            description: "disallow the unary operators `++` and `--`",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [{
            type: "object",
            properties: {
                allowForLoopAfterthoughts: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {

        var config = context.options[0];
        var allowInForAfterthought = false;

        if ((typeof config === "undefined" ? "undefined" : _typeof(config)) === "object") {
            allowInForAfterthought = config.allowForLoopAfterthoughts === true;
        }

        return {
            UpdateExpression: function UpdateExpression(node) {
                if (allowInForAfterthought && node.parent.type === "ForStatement") {
                    return;
                }
                context.report({
                    node: node,
                    message: "Unary operator '{{operator}}' used.",
                    data: {
                        operator: node.operator
                    }
                });
            }
        };
    }
};
;
module.exports = exports.default;
