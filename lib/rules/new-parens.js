/**
 * @fileoverview Rule to flag when using constructor without parentheses
 * @author Ilya Volodin
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks whether the given token is an opening parenthesis or not.
 *
 * @param {Token} token - The token to check.
 * @returns {boolean} `true` if the token is an opening parenthesis.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
function isOpeningParen(token) {
    return token.type === "Punctuator" && token.value === "(";
}

/**
 * Checks whether the given token is an closing parenthesis or not.
 *
 * @param {Token} token - The token to check.
 * @returns {boolean} `true` if the token is an closing parenthesis.
 */
function isClosingParen(token) {
    return token.type === "Punctuator" && token.value === ")";
}

/**
 * Checks whether the given node is inside of another given node.
 *
 * @param {ASTNode|Token} inner - The inner node to check.
 * @param {ASTNode|Token} outer - The outer node to check.
 * @returns {boolean} `true` if the `inner` is in `outer`.
 */
function isInRange(inner, outer) {
    var ir = inner.range;
    var or = outer.range;

    return or[0] <= ir[0] && ir[1] <= or[1];
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "require parentheses when invoking a constructor with no arguments",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [],

        fixable: "code"
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();

        return {
            NewExpression: function NewExpression(node) {
                var token = sourceCode.getTokenAfter(node.callee);

                // Skip ')'
                while (token && isClosingParen(token)) {
                    token = sourceCode.getTokenAfter(token);
                }

                if (!(token && isOpeningParen(token) && isInRange(token, node))) {
                    context.report({
                        node: node,
                        message: "Missing '()' invoking a constructor.",
                        fix: function fix(fixer) {
                            return fixer.insertTextAfter(node, "()");
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
