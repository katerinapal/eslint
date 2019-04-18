"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _astUtils = require("../ast-utils");

var _astUtils2 = _interopRequireDefault(_astUtils);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Validates spacing before and after semicolon
 * @author Mathias Schreck
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "enforce consistent spacing before and after semicolons",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [{
            type: "object",
            properties: {
                before: {
                    type: "boolean"
                },
                after: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {

        var config = context.options[0],
            sourceCode = context.getSourceCode();
        var requireSpaceBefore = false,
            requireSpaceAfter = true;

        if ((typeof config === "undefined" ? "undefined" : _typeof(config)) === "object") {
            if (config.hasOwnProperty("before")) {
                requireSpaceBefore = config.before;
            }
            if (config.hasOwnProperty("after")) {
                requireSpaceAfter = config.after;
            }
        }

        /**
         * Checks if a given token has leading whitespace.
         * @param {Object} token The token to check.
         * @returns {boolean} True if the given token has leading space, false if not.
         */
        function hasLeadingSpace(token) {
            var tokenBefore = sourceCode.getTokenBefore(token);

            return tokenBefore && _astUtils2.default.isTokenOnSameLine(tokenBefore, token) && sourceCode.isSpaceBetweenTokens(tokenBefore, token);
        }

        /**
         * Checks if a given token has trailing whitespace.
         * @param {Object} token The token to check.
         * @returns {boolean} True if the given token has trailing space, false if not.
         */
        function hasTrailingSpace(token) {
            var tokenAfter = sourceCode.getTokenAfter(token);

            return tokenAfter && _astUtils2.default.isTokenOnSameLine(token, tokenAfter) && sourceCode.isSpaceBetweenTokens(token, tokenAfter);
        }

        /**
         * Checks if the given token is the last token in its line.
         * @param {Token} token The token to check.
         * @returns {boolean} Whether or not the token is the last in its line.
         */
        function isLastTokenInCurrentLine(token) {
            var tokenAfter = sourceCode.getTokenAfter(token);

            return !(tokenAfter && _astUtils2.default.isTokenOnSameLine(token, tokenAfter));
        }

        /**
         * Checks if the given token is the first token in its line
         * @param {Token} token The token to check.
         * @returns {boolean} Whether or not the token is the first in its line.
         */
        function isFirstTokenInCurrentLine(token) {
            var tokenBefore = sourceCode.getTokenBefore(token);

            return !(tokenBefore && _astUtils2.default.isTokenOnSameLine(token, tokenBefore));
        }

        /**
         * Checks if the next token of a given token is a closing parenthesis.
         * @param {Token} token The token to check.
         * @returns {boolean} Whether or not the next token of a given token is a closing parenthesis.
         */
        function isBeforeClosingParen(token) {
            var nextToken = sourceCode.getTokenAfter(token);

            return nextToken && nextToken.type === "Punctuator" && (nextToken.value === "}" || nextToken.value === ")");
        }

        /**
         * Checks if the given token is a semicolon.
         * @param {Token} token The token to check.
         * @returns {boolean} Whether or not the given token is a semicolon.
         */
        function isSemicolon(token) {
            return token.type === "Punctuator" && token.value === ";";
        }

        /**
         * Reports if the given token has invalid spacing.
         * @param {Token} token The semicolon token to check.
         * @param {ASTNode} node The corresponding node of the token.
         * @returns {void}
         */
        function checkSemicolonSpacing(token, node) {
            if (isSemicolon(token)) {
                var location = token.loc.start;

                if (hasLeadingSpace(token)) {
                    if (!requireSpaceBefore) {
                        context.report({
                            node: node,
                            loc: location,
                            message: "Unexpected whitespace before semicolon.",
                            fix: function fix(fixer) {
                                var tokenBefore = sourceCode.getTokenBefore(token);

                                return fixer.removeRange([tokenBefore.range[1], token.range[0]]);
                            }
                        });
                    }
                } else {
                    if (requireSpaceBefore) {
                        context.report({
                            node: node,
                            loc: location,
                            message: "Missing whitespace before semicolon.",
                            fix: function fix(fixer) {
                                return fixer.insertTextBefore(token, " ");
                            }
                        });
                    }
                }

                if (!isFirstTokenInCurrentLine(token) && !isLastTokenInCurrentLine(token) && !isBeforeClosingParen(token)) {
                    if (hasTrailingSpace(token)) {
                        if (!requireSpaceAfter) {
                            context.report({
                                node: node,
                                loc: location,
                                message: "Unexpected whitespace after semicolon.",
                                fix: function fix(fixer) {
                                    var tokenAfter = sourceCode.getTokenAfter(token);

                                    return fixer.removeRange([token.range[1], tokenAfter.range[0]]);
                                }
                            });
                        }
                    } else {
                        if (requireSpaceAfter) {
                            context.report({
                                node: node,
                                loc: location,
                                message: "Missing whitespace after semicolon.",
                                fix: function fix(fixer) {
                                    return fixer.insertTextAfter(token, " ");
                                }
                            });
                        }
                    }
                }
            }
        }

        /**
         * Checks the spacing of the semicolon with the assumption that the last token is the semicolon.
         * @param {ASTNode} node The node to check.
         * @returns {void}
         */
        function checkNode(node) {
            var token = sourceCode.getLastToken(node);

            checkSemicolonSpacing(token, node);
        }

        return {
            VariableDeclaration: checkNode,
            ExpressionStatement: checkNode,
            BreakStatement: checkNode,
            ContinueStatement: checkNode,
            DebuggerStatement: checkNode,
            ReturnStatement: checkNode,
            ThrowStatement: checkNode,
            ForStatement: function ForStatement(node) {
                if (node.init) {
                    checkSemicolonSpacing(sourceCode.getTokenAfter(node.init), node);
                }

                if (node.test) {
                    checkSemicolonSpacing(sourceCode.getTokenAfter(node.test), node);
                }
            }
        };
    }
};
;
module.exports = exports.default;
