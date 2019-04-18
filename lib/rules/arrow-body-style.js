/**
 * @fileoverview Rule to require braces in arrow function body.
 * @author Alberto Rodríguez
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
            description: "require braces around arrow function bodies",
            category: "ECMAScript 6",
            recommended: false
        },

        schema: {
            anyOf: [{
                type: "array",
                items: [{
                    enum: ["always", "never"]
                }],
                minItems: 0,
                maxItems: 1
            }, {
                type: "array",
                items: [{
                    enum: ["as-needed"]
                }, {
                    type: "object",
                    properties: {
                        requireReturnForObjectLiteral: { type: "boolean" }
                    },
                    additionalProperties: false
                }],
                minItems: 0,
                maxItems: 2
            }]
        },

        fixable: "code"
    },

    create: function create(context) {
        var options = context.options;
        var always = options[0] === "always";
        var asNeeded = !options[0] || options[0] === "as-needed";
        var never = options[0] === "never";
        var requireReturnForObjectLiteral = options[1] && options[1].requireReturnForObjectLiteral;
        var sourceCode = context.getSourceCode();

        /**
         * Determines whether a arrow function body needs braces
         * @param {ASTNode} node The arrow function node.
         * @returns {void}
         */
        function validate(node) {
            var arrowBody = node.body;

            if (arrowBody.type === "BlockStatement") {
                var blockBody = arrowBody.body;

                if (blockBody.length !== 1 && !never) {
                    return;
                }

                if (asNeeded && requireReturnForObjectLiteral && blockBody[0].type === "ReturnStatement" && blockBody[0].argument && blockBody[0].argument.type === "ObjectExpression") {
                    return;
                }

                if (never || asNeeded && blockBody[0].type === "ReturnStatement") {
                    context.report({
                        node: node,
                        loc: arrowBody.loc.start,
                        message: "Unexpected block statement surrounding arrow body.",
                        fix: function fix(fixer) {
                            if (blockBody.length !== 1 || blockBody[0].type !== "ReturnStatement" || !blockBody[0].argument) {
                                return null;
                            }

                            var sourceText = sourceCode.getText();
                            var returnKeyword = sourceCode.getFirstToken(blockBody[0]);
                            var firstValueToken = sourceCode.getTokenAfter(returnKeyword);
                            var lastValueToken = sourceCode.getLastToken(blockBody[0]);

                            if (lastValueToken.type === "Punctuator" && lastValueToken.value === ";") {

                                /* The last token of the returned value is the last token of the ReturnExpression (if
                                 * the ReturnExpression has no semicolon), or the second-to-last token (if the ReturnExpression
                                 * has a semicolon).
                                 */
                                lastValueToken = sourceCode.getTokenBefore(lastValueToken);
                            }

                            var tokenAfterArrowBody = sourceCode.getTokenAfter(arrowBody);

                            if (tokenAfterArrowBody && tokenAfterArrowBody.type === "Punctuator" && /^[([/`+-]/.test(tokenAfterArrowBody.value)) {

                                // Don't do a fix if the next token would cause ASI issues when preceded by the returned value.
                                return null;
                            }

                            var textBeforeReturn = sourceText.slice(arrowBody.range[0] + 1, returnKeyword.range[0]);
                            var textBetweenReturnAndValue = sourceText.slice(returnKeyword.range[1], firstValueToken.range[0]);
                            var rawReturnValueText = sourceText.slice(firstValueToken.range[0], lastValueToken.range[1]);
                            var returnValueText = firstValueToken.value === "{" ? "(" + rawReturnValueText + ")" : rawReturnValueText;
                            var textAfterValue = sourceText.slice(lastValueToken.range[1], blockBody[0].range[1] - 1);
                            var textAfterReturnStatement = sourceText.slice(blockBody[0].range[1], arrowBody.range[1] - 1);

                            /*
                             * For fixes that only contain spaces around the return value, remove the extra spaces.
                             * This avoids ugly fixes that end up with extra spaces after the arrow, e.g. `() =>   0 ;`
                             */
                            return fixer.replaceText(arrowBody, (textBeforeReturn + textBetweenReturnAndValue).replace(/^ *$/, "") + returnValueText + (textAfterValue + textAfterReturnStatement).replace(/^ *$/, ""));
                        }
                    });
                }
            } else {
                if (always || asNeeded && requireReturnForObjectLiteral && arrowBody.type === "ObjectExpression") {
                    context.report({
                        node: node,
                        loc: arrowBody.loc.start,
                        message: "Expected block statement surrounding arrow body.",
                        fix: function fix(fixer) {
                            var lastTokenBeforeBody = sourceCode.getTokensBetween(sourceCode.getFirstToken(node), arrowBody).reverse().find(function (token) {
                                return token.value !== "(";
                            });

                            var firstBodyToken = sourceCode.getTokenAfter(lastTokenBeforeBody);

                            return fixer.replaceTextRange([firstBodyToken.range[0], node.range[1]], "{return " + sourceCode.getText().slice(firstBodyToken.range[0], node.range[1]) + "}");
                        }
                    });
                }
            }
        }

        return {
            ArrowFunctionExpression: validate
        };
    }
};
;
module.exports = exports.default;
