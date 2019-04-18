"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keywords = require("../util/keywords");

var _keywords2 = _interopRequireDefault(_keywords);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Rule to warn about using dot notation instead of square bracket notation when possible.
 * @author Josh Perez
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

exports.default = {
    meta: {
        docs: {
            description: "enforce dot notation whenever possible",
            category: "Best Practices",
            recommended: false
        },

        schema: [{
            type: "object",
            properties: {
                allowKeywords: {
                    type: "boolean"
                },
                allowPattern: {
                    type: "string"
                }
            },
            additionalProperties: false
        }],

        fixable: "code"
    },

    create: function create(context) {
        var options = context.options[0] || {};
        var allowKeywords = options.allowKeywords === void 0 || !!options.allowKeywords;
        var sourceCode = context.getSourceCode();

        var allowPattern = void 0;

        if (options.allowPattern) {
            allowPattern = new RegExp(options.allowPattern);
        }

        return {
            MemberExpression: function MemberExpression(node) {
                if (node.computed && node.property.type === "Literal" && validIdentifier.test(node.property.value) && (allowKeywords || _keywords2.default.indexOf(String(node.property.value)) === -1)) {
                    if (!(allowPattern && allowPattern.test(node.property.value))) {
                        context.report({
                            node: node.property,
                            message: "[{{propertyValue}}] is better written in dot notation.",
                            data: {
                                propertyValue: JSON.stringify(node.property.value)
                            },
                            fix: function fix(fixer) {
                                var leftBracket = sourceCode.getTokenBefore(node.property);
                                var rightBracket = sourceCode.getTokenAfter(node.property);
                                var textBeforeProperty = sourceCode.text.slice(leftBracket.range[1], node.property.range[0]);
                                var textAfterProperty = sourceCode.text.slice(node.property.range[1], rightBracket.range[0]);

                                if (textBeforeProperty.trim() || textAfterProperty.trim()) {

                                    // Don't perform any fixes if there are comments inside the brackets.
                                    return null;
                                }

                                return fixer.replaceTextRange([leftBracket.range[0], rightBracket.range[1]], "." + node.property.value);
                            }
                        });
                    }
                }
                if (!allowKeywords && !node.computed && _keywords2.default.indexOf(String(node.property.name)) !== -1) {
                    context.report({
                        node: node.property,
                        message: ".{{propertyName}} is a syntax error.",
                        data: {
                            propertyName: node.property.name
                        },
                        fix: function fix(fixer) {
                            var dot = sourceCode.getTokenBefore(node.property);
                            var textAfterDot = sourceCode.text.slice(dot.range[1], node.property.range[0]);

                            if (textAfterDot.trim()) {

                                // Don't perform any fixes if there are comments between the dot and the property name.
                                return null;
                            }

                            return fixer.replaceTextRange([dot.range[0], node.property.range[1]], "[" + textAfterDot + "\"" + node.property.name + "\"]");
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
