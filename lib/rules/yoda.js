/**
 * @fileoverview Rule to require or disallow yoda comparisons
 * @author Nicholas C. Zakas
 */
"use strict";

//--------------------------------------------------------------------------
// Helpers
//--------------------------------------------------------------------------

/**
 * Determines whether an operator is a comparison operator.
 * @param {string} operator The operator to check.
 * @returns {boolean} Whether or not it is a comparison operator.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
function isComparisonOperator(operator) {
    return (/^(==|===|!=|!==|<|>|<=|>=)$/.test(operator)
    );
}

/**
 * Determines whether an operator is an equality operator.
 * @param {string} operator The operator to check.
 * @returns {boolean} Whether or not it is an equality operator.
 */
function isEqualityOperator(operator) {
    return (/^(==|===)$/.test(operator)
    );
}

/**
 * Determines whether an operator is one used in a range test.
 * Allowed operators are `<` and `<=`.
 * @param {string} operator The operator to check.
 * @returns {boolean} Whether the operator is used in range tests.
 */
function isRangeTestOperator(operator) {
    return ["<", "<="].indexOf(operator) >= 0;
}

/**
 * Determines whether a non-Literal node is a negative number that should be
 * treated as if it were a single Literal node.
 * @param {ASTNode} node Node to test.
 * @returns {boolean} True if the node is a negative number that looks like a
 *                    real literal and should be treated as such.
 */
function looksLikeLiteral(node) {
    return node.type === "UnaryExpression" && node.operator === "-" && node.prefix && node.argument.type === "Literal" && typeof node.argument.value === "number";
}

/**
 * Attempts to derive a Literal node from nodes that are treated like literals.
 * @param {ASTNode} node Node to normalize.
 * @returns {ASTNode} The original node if the node is already a Literal, or a
 *                    normalized Literal node with the negative number as the
 *                    value if the node represents a negative number literal,
 *                    otherwise null if the node cannot be converted to a
 *                    normalized literal.
 */
function getNormalizedLiteral(node) {
    if (node.type === "Literal") {
        return node;
    }

    if (looksLikeLiteral(node)) {
        return {
            type: "Literal",
            value: -node.argument.value,
            raw: "-" + node.argument.value
        };
    }

    return null;
}

/**
 * Checks whether two expressions reference the same value. For example:
 *     a = a
 *     a.b = a.b
 *     a[0] = a[0]
 *     a['b'] = a['b']
 * @param   {ASTNode} a Left side of the comparison.
 * @param   {ASTNode} b Right side of the comparison.
 * @returns {boolean}   True if both sides match and reference the same value.
 */
function same(a, b) {
    if (a.type !== b.type) {
        return false;
    }

    switch (a.type) {
        case "Identifier":
            return a.name === b.name;

        case "Literal":
            return a.value === b.value;

        case "MemberExpression":

            // x[0] = x[0]
            // x[y] = x[y]
            // x.y = x.y
            return same(a.object, b.object) && same(a.property, b.property);

        case "ThisExpression":
            return true;

        default:
            return false;
    }
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "require or disallow \"Yoda\" conditions",
            category: "Best Practices",
            recommended: false
        },

        schema: [{
            enum: ["always", "never"]
        }, {
            type: "object",
            properties: {
                exceptRange: {
                    type: "boolean"
                },
                onlyEquality: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }],

        fixable: "code"
    },

    create: function create(context) {

        // Default to "never" (!always) if no option
        var always = context.options[0] === "always";
        var exceptRange = context.options[1] && context.options[1].exceptRange;
        var onlyEquality = context.options[1] && context.options[1].onlyEquality;

        var sourceCode = context.getSourceCode();

        /**
         * Determines whether node represents a range test.
         * A range test is a "between" test like `(0 <= x && x < 1)` or an "outside"
         * test like `(x < 0 || 1 <= x)`. It must be wrapped in parentheses, and
         * both operators must be `<` or `<=`. Finally, the literal on the left side
         * must be less than or equal to the literal on the right side so that the
         * test makes any sense.
         * @param {ASTNode} node LogicalExpression node to test.
         * @returns {boolean} Whether node is a range test.
         */
        function isRangeTest(node) {
            var left = node.left,
                right = node.right;

            /**
             * Determines whether node is of the form `0 <= x && x < 1`.
             * @returns {boolean} Whether node is a "between" range test.
             */
            function isBetweenTest() {
                var leftLiteral = void 0,
                    rightLiteral = void 0;

                return node.operator === "&&" && (leftLiteral = getNormalizedLiteral(left.left)) && (rightLiteral = getNormalizedLiteral(right.right)) && leftLiteral.value <= rightLiteral.value && same(left.right, right.left);
            }

            /**
             * Determines whether node is of the form `x < 0 || 1 <= x`.
             * @returns {boolean} Whether node is an "outside" range test.
             */
            function isOutsideTest() {
                var leftLiteral = void 0,
                    rightLiteral = void 0;

                return node.operator === "||" && (leftLiteral = getNormalizedLiteral(left.right)) && (rightLiteral = getNormalizedLiteral(right.left)) && leftLiteral.value <= rightLiteral.value && same(left.left, right.right);
            }

            /**
             * Determines whether node is wrapped in parentheses.
             * @returns {boolean} Whether node is preceded immediately by an open
             *                    paren token and followed immediately by a close
             *                    paren token.
             */
            function isParenWrapped() {
                var tokenBefore = void 0,
                    tokenAfter = void 0;

                return (tokenBefore = sourceCode.getTokenBefore(node)) && tokenBefore.value === "(" && (tokenAfter = sourceCode.getTokenAfter(node)) && tokenAfter.value === ")";
            }

            return node.type === "LogicalExpression" && left.type === "BinaryExpression" && right.type === "BinaryExpression" && isRangeTestOperator(left.operator) && isRangeTestOperator(right.operator) && (isBetweenTest() || isOutsideTest()) && isParenWrapped();
        }

        var OPERATOR_FLIP_MAP = {
            "===": "===",
            "!==": "!==",
            "==": "==",
            "!=": "!=",
            "<": ">",
            ">": "<",
            "<=": ">=",
            ">=": "<="
        };

        /**
        * Returns a string representation of a BinaryExpression node with its sides/operator flipped around.
        * @param {ASTNode} node The BinaryExpression node
        * @returns {string} A string representation of the node with the sides and operator flipped
        */
        function getFlippedString(node) {
            var operatorToken = sourceCode.getTokensBetween(node.left, node.right).find(function (token) {
                return token.value === node.operator;
            });
            var textBeforeOperator = sourceCode.getText().slice(sourceCode.getTokenBefore(operatorToken).range[1], operatorToken.range[0]);
            var textAfterOperator = sourceCode.getText().slice(operatorToken.range[1], sourceCode.getTokenAfter(operatorToken).range[0]);
            var leftText = sourceCode.getText().slice(sourceCode.getFirstToken(node).range[0], sourceCode.getTokenBefore(operatorToken).range[1]);
            var rightText = sourceCode.getText().slice(sourceCode.getTokenAfter(operatorToken).range[0], sourceCode.getLastToken(node).range[1]);

            return rightText + textBeforeOperator + OPERATOR_FLIP_MAP[operatorToken.value] + textAfterOperator + leftText;
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            BinaryExpression: function BinaryExpression(node) {
                var expectedLiteral = always ? node.left : node.right;
                var expectedNonLiteral = always ? node.right : node.left;

                // If `expectedLiteral` is not a literal, and `expectedNonLiteral` is a literal, raise an error.
                if ((expectedNonLiteral.type === "Literal" || looksLikeLiteral(expectedNonLiteral)) && !(expectedLiteral.type === "Literal" || looksLikeLiteral(expectedLiteral)) && !(!isEqualityOperator(node.operator) && onlyEquality) && isComparisonOperator(node.operator) && !(exceptRange && isRangeTest(context.getAncestors().pop()))) {
                    context.report({
                        node: node,
                        message: "Expected literal to be on the {{expectedSide}} side of {{operator}}.",
                        data: {
                            operator: node.operator,
                            expectedSide: always ? "left" : "right"
                        },
                        fix: function fix(fixer) {
                            return fixer.replaceText(node, getFlippedString(node));
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
