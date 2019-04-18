/**
 * @fileoverview Rule to disallow unnecessary computed property keys in object literals
 * @author Burak Yigit Kaya
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

var MESSAGE_UNNECESSARY_COMPUTED = "Unnecessarily computed property [{{property}}] found.";

exports.default = {
    meta: {
        docs: {
            description: "disallow unnecessary computed property keys in object literals",
            category: "ECMAScript 6",
            recommended: false
        },

        schema: [],

        fixable: "code"
    },
    create: function create(context) {
        var sourceCode = context.getSourceCode();

        return {
            Property: function Property(node) {
                if (!node.computed) {
                    return;
                }

                var key = node.key,
                    nodeType = _typeof(key.value);

                if (key.type === "Literal" && (nodeType === "string" || nodeType === "number")) {
                    context.report({
                        node: node,
                        message: MESSAGE_UNNECESSARY_COMPUTED,
                        data: { property: sourceCode.getText(key) },
                        fix: function fix(fixer) {
                            var leftSquareBracket = sourceCode.getFirstToken(node, node.value.generator || node.value.async ? 1 : 0);
                            var rightSquareBracket = sourceCode.getTokensBetween(node.key, node.value).find(function (token) {
                                return token.value === "]";
                            });

                            var tokensBetween = sourceCode.getTokensBetween(leftSquareBracket, rightSquareBracket, 1);

                            if (tokensBetween.slice(0, -1).some(function (token, index) {
                                return sourceCode.getText().slice(token.range[1], tokensBetween[index + 1].range[0]).trim();
                            })) {

                                // If there are comments between the brackets and the property name, don't do a fix.
                                return null;
                            }
                            return fixer.replaceTextRange([leftSquareBracket.range[0], rightSquareBracket.range[1]], key.raw);
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
