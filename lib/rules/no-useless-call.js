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
 * @fileoverview A rule to disallow unnecessary `.call()` and `.apply()`.
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks whether or not a node is a `.call()`/`.apply()`.
 * @param {ASTNode} node - A CallExpression node to check.
 * @returns {boolean} Whether or not the node is a `.call()`/`.apply()`.
 */
function isCallOrNonVariadicApply(node) {
    return node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier" && node.callee.computed === false && (node.callee.property.name === "call" && node.arguments.length >= 1 || node.callee.property.name === "apply" && node.arguments.length === 2 && node.arguments[1].type === "ArrayExpression");
}

/**
 * Checks whether or not the tokens of two given nodes are same.
 * @param {ASTNode} left - A node 1 to compare.
 * @param {ASTNode} right - A node 2 to compare.
 * @param {SourceCode} sourceCode - The ESLint source code object.
 * @returns {boolean} the source code for the given node.
 */
function equalTokens(left, right, sourceCode) {
    var tokensL = sourceCode.getTokens(left);
    var tokensR = sourceCode.getTokens(right);

    if (tokensL.length !== tokensR.length) {
        return false;
    }
    for (var i = 0; i < tokensL.length; ++i) {
        if (tokensL[i].type !== tokensR[i].type || tokensL[i].value !== tokensR[i].value) {
            return false;
        }
    }

    return true;
}

/**
 * Checks whether or not `thisArg` is not changed by `.call()`/`.apply()`.
 * @param {ASTNode|null} expectedThis - The node that is the owner of the applied function.
 * @param {ASTNode} thisArg - The node that is given to the first argument of the `.call()`/`.apply()`.
 * @param {SourceCode} sourceCode - The ESLint source code object.
 * @returns {boolean} Whether or not `thisArg` is not changed by `.call()`/`.apply()`.
 */
function isValidThisArg(expectedThis, thisArg, sourceCode) {
    if (!expectedThis) {
        return _astUtils2.default.isNullOrUndefined(thisArg);
    }
    return equalTokens(expectedThis, thisArg, sourceCode);
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow unnecessary calls to `.call()` and `.apply()`",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();

        return {
            CallExpression: function CallExpression(node) {
                if (!isCallOrNonVariadicApply(node)) {
                    return;
                }

                var applied = node.callee.object;
                var expectedThis = applied.type === "MemberExpression" ? applied.object : null;
                var thisArg = node.arguments[0];

                if (isValidThisArg(expectedThis, thisArg, sourceCode)) {
                    context.report(node, "unnecessary '.{{name}}()'.", { name: node.callee.property.name });
                }
            }
        };
    }
};
;
module.exports = exports.default;
