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
 * @fileoverview Rule to disallow negating the left operand of relational operators
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks whether the given operator is a relational operator or not.
 *
 * @param {string} op - The operator type to check.
 * @returns {boolean} `true` if the operator is a relational operator.
 */
function isRelationalOperator(op) {
    return op === "in" || op === "instanceof";
}

/**
 * Checks whether the given node is a logical negation expression or not.
 *
 * @param {ASTNode} node - The node to check.
 * @returns {boolean} `true` if the node is a logical negation expression.
 */
function isNegation(node) {
    return node.type === "UnaryExpression" && node.operator === "!";
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow negating the left operand of relational operators",
            category: "Possible Errors",
            recommended: false
        },
        schema: [],
        fixable: "code"
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();

        return {
            BinaryExpression: function BinaryExpression(node) {
                if (isRelationalOperator(node.operator) && isNegation(node.left) && !_astUtils2.default.isParenthesised(sourceCode, node.left)) {
                    context.report({
                        node: node,
                        loc: node.left.loc,
                        message: "Unexpected negating the left operand of '{{operator}}' operator.",
                        data: node,

                        fix: function fix(fixer) {
                            var negationToken = sourceCode.getFirstToken(node.left);
                            var fixRange = [negationToken.range[1], node.range[1]];
                            var text = sourceCode.text.slice(fixRange[0], fixRange[1]);

                            return fixer.replaceTextRange(fixRange, "(" + text + ")");
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
