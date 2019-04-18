/**
 * @fileoverview Rule to require parens in arrow function arguments.
 * @author Jxck
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    meta: {
        docs: {
            description: "require parentheses around arrow function arguments",
            category: "ECMAScript 6",
            recommended: false
        },

        fixable: "code",

        schema: [{
            enum: ["always", "as-needed"]
        }, {
            type: "object",
            properties: {
                requireForBlockBody: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {
        var message = "Expected parentheses around arrow function argument.";
        var asNeededMessage = "Unexpected parentheses around single function argument.";
        var asNeeded = context.options[0] === "as-needed";
        var requireForBlockBodyMessage = "Unexpected parentheses around single function argument having a body with no curly braces";
        var requireForBlockBodyNoParensMessage = "Expected parentheses around arrow function argument having a body with curly braces.";
        var requireForBlockBody = asNeeded && context.options[1] && context.options[1].requireForBlockBody === true;

        var sourceCode = context.getSourceCode();

        /**
         * Determines whether a arrow function argument end with `)`
         * @param {ASTNode} node The arrow function node.
         * @returns {void}
         */
        function parens(node) {
            var token = sourceCode.getFirstToken(node, node.async ? 1 : 0);

            // "as-needed", { "requireForBlockBody": true }: x => x
            if (requireForBlockBody && node.params.length === 1 && node.params[0].type === "Identifier" && node.body.type !== "BlockStatement") {
                if (token.type === "Punctuator" && token.value === "(") {
                    context.report({
                        node: node,
                        message: requireForBlockBodyMessage,
                        fix: function fix(fixer) {
                            var paramToken = context.getTokenAfter(token);
                            var closingParenToken = context.getTokenAfter(paramToken);

                            return fixer.replaceTextRange([token.range[0], closingParenToken.range[1]], paramToken.value);
                        }
                    });
                }
                return;
            }

            if (requireForBlockBody && node.body.type === "BlockStatement") {
                if (token.type !== "Punctuator" || token.value !== "(") {
                    context.report({
                        node: node,
                        message: requireForBlockBodyNoParensMessage,
                        fix: function fix(fixer) {
                            return fixer.replaceText(token, "(" + token.value + ")");
                        }
                    });
                }
                return;
            }

            // "as-needed": x => x
            if (asNeeded && node.params.length === 1 && node.params[0].type === "Identifier") {
                if (token.type === "Punctuator" && token.value === "(") {
                    context.report({
                        node: node,
                        message: asNeededMessage,
                        fix: function fix(fixer) {
                            var paramToken = context.getTokenAfter(token);
                            var closingParenToken = context.getTokenAfter(paramToken);

                            return fixer.replaceTextRange([token.range[0], closingParenToken.range[1]], paramToken.value);
                        }
                    });
                }
                return;
            }

            if (token.type === "Identifier") {
                var after = sourceCode.getTokenAfter(token);

                // (x) => x
                if (after.value !== ")") {
                    context.report({
                        node: node,
                        message: message,
                        fix: function fix(fixer) {
                            return fixer.replaceText(token, "(" + token.value + ")");
                        }
                    });
                }
            }
        }

        return {
            ArrowFunctionExpression: parens
        };
    }
};
;
module.exports = exports.default;
