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
 * @fileoverview A rule to disallow the type conversions with shorter notations.
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var INDEX_OF_PATTERN = /^(?:i|lastI)ndexOf$/;
var ALLOWABLE_OPERATORS = ["~", "!!", "+", "*"];

/**
 * Parses and normalizes an option object.
 * @param {Object} options - An option object to parse.
 * @returns {Object} The parsed and normalized option object.
 */
function parseOptions(options) {
    options = options || {};
    return {
        boolean: "boolean" in options ? Boolean(options.boolean) : true,
        number: "number" in options ? Boolean(options.number) : true,
        string: "string" in options ? Boolean(options.string) : true,
        allow: options.allow || []
    };
}

/**
 * Checks whether or not a node is a double logical nigating.
 * @param {ASTNode} node - An UnaryExpression node to check.
 * @returns {boolean} Whether or not the node is a double logical nigating.
 */
function isDoubleLogicalNegating(node) {
    return node.operator === "!" && node.argument.type === "UnaryExpression" && node.argument.operator === "!";
}

/**
 * Checks whether or not a node is a binary negating of `.indexOf()` method calling.
 * @param {ASTNode} node - An UnaryExpression node to check.
 * @returns {boolean} Whether or not the node is a binary negating of `.indexOf()` method calling.
 */
function isBinaryNegatingOfIndexOf(node) {
    return node.operator === "~" && node.argument.type === "CallExpression" && node.argument.callee.type === "MemberExpression" && node.argument.callee.property.type === "Identifier" && INDEX_OF_PATTERN.test(node.argument.callee.property.name);
}

/**
 * Checks whether or not a node is a multiplying by one.
 * @param {BinaryExpression} node - A BinaryExpression node to check.
 * @returns {boolean} Whether or not the node is a multiplying by one.
 */
function isMultiplyByOne(node) {
    return node.operator === "*" && (node.left.type === "Literal" && node.left.value === 1 || node.right.type === "Literal" && node.right.value === 1);
}

/**
 * Checks whether the result of a node is numeric or not
 * @param {ASTNode} node The node to test
 * @returns {boolean} true if the node is a number literal or a `Number()`, `parseInt` or `parseFloat` call
 */
function isNumeric(node) {
    return node.type === "Literal" && typeof node.value === "number" || node.type === "CallExpression" && (node.callee.name === "Number" || node.callee.name === "parseInt" || node.callee.name === "parseFloat");
}

/**
 * Returns the first non-numeric operand in a BinaryExpression. Designed to be
 * used from bottom to up since it walks up the BinaryExpression trees using
 * node.parent to find the result.
 * @param {BinaryExpression} node The BinaryExpression node to be walked up on
 * @returns {ASTNode|null} The first non-numeric item in the BinaryExpression tree or null
 */
function getNonNumericOperand(node) {
    var left = node.left,
        right = node.right;

    if (right.type !== "BinaryExpression" && !isNumeric(right)) {
        return right;
    }

    if (left.type !== "BinaryExpression" && !isNumeric(left)) {
        return left;
    }

    return null;
}

/**
 * Checks whether a node is an empty string literal or not.
 * @param {ASTNode} node The node to check.
 * @returns {boolean} Whether or not the passed in node is an
 * empty string literal or not.
 */
function isEmptyString(node) {
    return _astUtils2.default.isStringLiteral(node) && (node.value === "" || node.type === "TemplateLiteral" && node.quasis.length === 1 && node.quasis[0].value.cooked === "");
}

/**
 * Checks whether or not a node is a concatenating with an empty string.
 * @param {ASTNode} node - A BinaryExpression node to check.
 * @returns {boolean} Whether or not the node is a concatenating with an empty string.
 */
function isConcatWithEmptyString(node) {
    return node.operator === "+" && (isEmptyString(node.left) && !_astUtils2.default.isStringLiteral(node.right) || isEmptyString(node.right) && !_astUtils2.default.isStringLiteral(node.left));
}

/**
 * Checks whether or not a node is appended with an empty string.
 * @param {ASTNode} node - An AssignmentExpression node to check.
 * @returns {boolean} Whether or not the node is appended with an empty string.
 */
function isAppendEmptyString(node) {
    return node.operator === "+=" && isEmptyString(node.right);
}

/**
 * Returns the operand that is not an empty string from a flagged BinaryExpression.
 * @param {ASTNode} node - The flagged BinaryExpression node to check.
 * @returns {ASTNode} The operand that is not an empty string from a flagged BinaryExpression.
 */
function getNonEmptyOperand(node) {
    return isEmptyString(node.left) ? node.right : node.left;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow shorthand type conversions",
            category: "Best Practices",
            recommended: false
        },

        fixable: "code",
        schema: [{
            type: "object",
            properties: {
                boolean: {
                    type: "boolean"
                },
                number: {
                    type: "boolean"
                },
                string: {
                    type: "boolean"
                },
                allow: {
                    type: "array",
                    items: {
                        enum: ALLOWABLE_OPERATORS
                    },
                    uniqueItems: true
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {
        var options = parseOptions(context.options[0]);
        var sourceCode = context.getSourceCode();

        /**
        * Reports an error and autofixes the node
        * @param {ASTNode} node - An ast node to report the error on.
        * @param {string} recommendation - The recommended code for the issue
        * @param {bool} shouldFix - Whether this report should fix the node
        * @returns {void}
        */
        function report(node, recommendation, shouldFix) {
            shouldFix = typeof shouldFix === "undefined" ? true : shouldFix;
            var reportObj = {
                node: node,
                message: "use `{{recommendation}}` instead.",
                data: {
                    recommendation: recommendation
                }
            };

            if (shouldFix) {
                reportObj.fix = function (fixer) {
                    return fixer.replaceText(node, recommendation);
                };
            }

            context.report(reportObj);
        }

        return {
            UnaryExpression: function UnaryExpression(node) {
                var operatorAllowed = void 0;

                // !!foo
                operatorAllowed = options.allow.indexOf("!!") >= 0;
                if (!operatorAllowed && options.boolean && isDoubleLogicalNegating(node)) {
                    var recommendation = "Boolean(" + sourceCode.getText(node.argument.argument) + ")";

                    report(node, recommendation);
                }

                // ~foo.indexOf(bar)
                operatorAllowed = options.allow.indexOf("~") >= 0;
                if (!operatorAllowed && options.boolean && isBinaryNegatingOfIndexOf(node)) {
                    var _recommendation = sourceCode.getText(node.argument) + " !== -1";

                    report(node, _recommendation, false);
                }

                // +foo
                operatorAllowed = options.allow.indexOf("+") >= 0;
                if (!operatorAllowed && options.number && node.operator === "+" && !isNumeric(node.argument)) {
                    var _recommendation2 = "Number(" + sourceCode.getText(node.argument) + ")";

                    report(node, _recommendation2);
                }
            },

            // Use `:exit` to prevent double reporting
            "BinaryExpression:exit": function BinaryExpressionExit(node) {
                var operatorAllowed = void 0;

                // 1 * foo
                operatorAllowed = options.allow.indexOf("*") >= 0;
                var nonNumericOperand = !operatorAllowed && options.number && isMultiplyByOne(node) && getNonNumericOperand(node);

                if (nonNumericOperand) {
                    var recommendation = "Number(" + sourceCode.getText(nonNumericOperand) + ")";

                    report(node, recommendation);
                }

                // "" + foo
                operatorAllowed = options.allow.indexOf("+") >= 0;
                if (!operatorAllowed && options.string && isConcatWithEmptyString(node)) {
                    var _recommendation3 = "String(" + sourceCode.getText(getNonEmptyOperand(node)) + ")";

                    report(node, _recommendation3);
                }
            },
            AssignmentExpression: function AssignmentExpression(node) {

                // foo += ""
                var operatorAllowed = options.allow.indexOf("+") >= 0;

                if (!operatorAllowed && options.string && isAppendEmptyString(node)) {
                    var code = sourceCode.getText(getNonEmptyOperand(node));
                    var recommendation = code + " = String(" + code + ")";

                    report(node, recommendation);
                }
            }
        };
    }
};
;
module.exports = exports.default;
