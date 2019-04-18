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
 * @fileoverview A rule to ensure whitespace before blocks.
 * @author Mathias Schreck <https://github.com/lo1tuma>
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "enforce consistent spacing before blocks",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [{
            oneOf: [{
                enum: ["always", "never"]
            }, {
                type: "object",
                properties: {
                    keywords: {
                        enum: ["always", "never"]
                    },
                    functions: {
                        enum: ["always", "never"]
                    },
                    classes: {
                        enum: ["always", "never"]
                    }
                },
                additionalProperties: false
            }]
        }]
    },

    create: function create(context) {
        var config = context.options[0],
            sourceCode = context.getSourceCode();
        var checkFunctions = true,
            checkKeywords = true,
            checkClasses = true;

        if ((typeof config === "undefined" ? "undefined" : _typeof(config)) === "object") {
            checkFunctions = config.functions !== "never";
            checkKeywords = config.keywords !== "never";
            checkClasses = config.classes !== "never";
        } else if (config === "never") {
            checkFunctions = false;
            checkKeywords = false;
            checkClasses = false;
        }

        /**
         * Checks whether or not a given token is an arrow operator (=>) or a keyword
         * in order to avoid to conflict with `arrow-spacing` and `keyword-spacing`.
         *
         * @param {Token} token - A token to check.
         * @returns {boolean} `true` if the token is an arrow operator.
         */
        function isConflicted(token) {
            return token.type === "Punctuator" && token.value === "=>" || token.type === "Keyword";
        }

        /**
         * Checks the given BlockStatement node has a preceding space if it doesn’t start on a new line.
         * @param {ASTNode|Token} node The AST node of a BlockStatement.
         * @returns {void} undefined.
         */
        function checkPrecedingSpace(node) {
            var precedingToken = sourceCode.getTokenBefore(node);
            var requireSpace = void 0;

            if (precedingToken && !isConflicted(precedingToken) && _astUtils2.default.isTokenOnSameLine(precedingToken, node)) {
                var hasSpace = sourceCode.isSpaceBetweenTokens(precedingToken, node);
                var parent = context.getAncestors().pop();

                if (parent.type === "FunctionExpression" || parent.type === "FunctionDeclaration") {
                    requireSpace = checkFunctions;
                } else if (node.type === "ClassBody") {
                    requireSpace = checkClasses;
                } else {
                    requireSpace = checkKeywords;
                }

                if (requireSpace) {
                    if (!hasSpace) {
                        context.report({
                            node: node,
                            message: "Missing space before opening brace.",
                            fix: function fix(fixer) {
                                return fixer.insertTextBefore(node, " ");
                            }
                        });
                    }
                } else {
                    if (hasSpace) {
                        context.report({
                            node: node,
                            message: "Unexpected space before opening brace.",
                            fix: function fix(fixer) {
                                return fixer.removeRange([precedingToken.range[1], node.range[0]]);
                            }
                        });
                    }
                }
            }
        }

        /**
         * Checks if the CaseBlock of an given SwitchStatement node has a preceding space.
         * @param {ASTNode} node The node of a SwitchStatement.
         * @returns {void} undefined.
         */
        function checkSpaceBeforeCaseBlock(node) {
            var cases = node.cases;
            var openingBrace = void 0;

            if (cases.length > 0) {
                openingBrace = sourceCode.getTokenBefore(cases[0]);
            } else {
                openingBrace = sourceCode.getLastToken(node, 1);
            }

            checkPrecedingSpace(openingBrace);
        }

        return {
            BlockStatement: checkPrecedingSpace,
            ClassBody: checkPrecedingSpace,
            SwitchStatement: checkSpaceBeforeCaseBlock
        };
    }
};
;
module.exports = exports.default;
