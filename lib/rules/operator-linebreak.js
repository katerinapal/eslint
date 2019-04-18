"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _astUtils = require("../ast-utils");

var _astUtils2 = _interopRequireDefault(_astUtils);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Operator linebreak - enforces operator linebreak style of two types: after and before
 * @author Benoît Zugmeyer
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "enforce consistent linebreak style for operators",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [{
            enum: ["after", "before", "none", null]
        }, {
            type: "object",
            properties: {
                overrides: {
                    type: "object",
                    properties: {
                        anyOf: {
                            type: "string",
                            enum: ["after", "before", "none", "ignore"]
                        }
                    }
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {

        var usedDefaultGlobal = !context.options[0];
        var globalStyle = context.options[0] || "after";
        var options = context.options[1] || {};
        var styleOverrides = options.overrides ? Object.assign({}, options.overrides) : {};

        if (usedDefaultGlobal && !styleOverrides["?"]) {
            styleOverrides["?"] = "before";
        }

        if (usedDefaultGlobal && !styleOverrides[":"]) {
            styleOverrides[":"] = "before";
        }

        var sourceCode = context.getSourceCode();

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        /**
         * Checks the operator placement
         * @param {ASTNode} node The node to check
         * @param {ASTNode} leftSide The node that comes before the operator in `node`
         * @private
         * @returns {void}
         */
        function validateNode(node, leftSide) {
            var leftToken = sourceCode.getLastToken(leftSide);
            var operatorToken = sourceCode.getTokenAfter(leftToken);

            // When the left part of a binary expression is a single expression wrapped in
            // parentheses (ex: `(a) + b`), leftToken will be the last token of the expression
            // and operatorToken will be the closing parenthesis.
            // The leftToken should be the last closing parenthesis, and the operatorToken
            // should be the token right after that.
            while (operatorToken.value === ")") {
                leftToken = operatorToken;
                operatorToken = sourceCode.getTokenAfter(operatorToken);
            }

            var rightToken = sourceCode.getTokenAfter(operatorToken);
            var operator = operatorToken.value;
            var operatorStyleOverride = styleOverrides[operator];
            var style = operatorStyleOverride || globalStyle;

            // if single line
            if (_astUtils2.default.isTokenOnSameLine(leftToken, operatorToken) && _astUtils2.default.isTokenOnSameLine(operatorToken, rightToken)) {

                // do nothing.

            } else if (operatorStyleOverride !== "ignore" && !_astUtils2.default.isTokenOnSameLine(leftToken, operatorToken) && !_astUtils2.default.isTokenOnSameLine(operatorToken, rightToken)) {

                // lone operator
                context.report({
                    node: node,
                    loc: {
                        line: operatorToken.loc.end.line,
                        column: operatorToken.loc.end.column
                    },
                    message: "Bad line breaking before and after '{{operator}}'.",
                    data: {
                        operator: operator
                    }
                });
            } else if (style === "before" && _astUtils2.default.isTokenOnSameLine(leftToken, operatorToken)) {

                context.report({
                    node: node,
                    loc: {
                        line: operatorToken.loc.end.line,
                        column: operatorToken.loc.end.column
                    },
                    message: "'{{operator}}' should be placed at the beginning of the line.",
                    data: {
                        operator: operator
                    }
                });
            } else if (style === "after" && _astUtils2.default.isTokenOnSameLine(operatorToken, rightToken)) {

                context.report({
                    node: node,
                    loc: {
                        line: operatorToken.loc.end.line,
                        column: operatorToken.loc.end.column
                    },
                    message: "'{{operator}}' should be placed at the end of the line.",
                    data: {
                        operator: operator
                    }
                });
            } else if (style === "none") {

                context.report({
                    node: node,
                    loc: {
                        line: operatorToken.loc.end.line,
                        column: operatorToken.loc.end.column
                    },
                    message: "There should be no line break before or after '{{operator}}'.",
                    data: {
                        operator: operator
                    }
                });
            }
        }

        /**
         * Validates a binary expression using `validateNode`
         * @param {BinaryExpression|LogicalExpression|AssignmentExpression} node node to be validated
         * @returns {void}
         */
        function validateBinaryExpression(node) {
            validateNode(node, node.left);
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            BinaryExpression: validateBinaryExpression,
            LogicalExpression: validateBinaryExpression,
            AssignmentExpression: validateBinaryExpression,
            VariableDeclarator: function VariableDeclarator(node) {
                if (node.init) {
                    validateNode(node, node.id);
                }
            },
            ConditionalExpression: function ConditionalExpression(node) {
                validateNode(node, node.test);
                validateNode(node, node.consequent);
            }
        };
    }
};
;
module.exports = exports.default;
