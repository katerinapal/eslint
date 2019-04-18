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
 * @fileoverview Rule to disallow whitespace before properties
 * @author Kai Cataldo
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow whitespace before properties",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",
        schema: []
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        /**
         * Finds opening bracket token of node's computed property
         * @param {ASTNode} node - the node to check
         * @returns {Token} opening bracket token of node's computed property
         * @private
         */
        function findOpeningBracket(node) {
            var token = sourceCode.getTokenBefore(node.property);

            while (token.value !== "[") {
                token = sourceCode.getTokenBefore(token);
            }
            return token;
        }

        /**
         * Reports whitespace before property token
         * @param {ASTNode} node - the node to report in the event of an error
         * @param {Token} leftToken - the left token
         * @param {Token} rightToken - the right token
         * @returns {void}
         * @private
         */
        function reportError(node, leftToken, rightToken) {
            var replacementText = node.computed ? "" : ".";

            context.report({
                node: node,
                message: "Unexpected whitespace before property {{propName}}.",
                data: {
                    propName: sourceCode.getText(node.property)
                },
                fix: function fix(fixer) {
                    if (!node.computed && _astUtils2.default.isDecimalInteger(node.object)) {

                        // If the object is a number literal, fixing it to something like 5.toString() would cause a SyntaxError.
                        // Don't fix this case.
                        return null;
                    }
                    return fixer.replaceTextRange([leftToken.range[1], rightToken.range[0]], replacementText);
                }
            });
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            MemberExpression: function MemberExpression(node) {
                var rightToken = void 0;
                var leftToken = void 0;

                if (!_astUtils2.default.isTokenOnSameLine(node.object, node.property)) {
                    return;
                }

                if (node.computed) {
                    rightToken = findOpeningBracket(node);
                    leftToken = sourceCode.getTokenBefore(rightToken);
                } else {
                    rightToken = sourceCode.getFirstToken(node.property);
                    leftToken = sourceCode.getTokenBefore(rightToken, 1);
                }

                if (sourceCode.isSpaceBetweenTokens(leftToken, rightToken)) {
                    reportError(node, leftToken, rightToken);
                }
            }
        };
    }
};
;
module.exports = exports.default;
