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
 * @fileoverview Enforce newlines between operands of ternary expressions
 * @author Kai Cataldo
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "enforce newlines between operands of ternary expressions",
            category: "Stylistic Issues",
            recommended: false
        },
        schema: [{
            enum: ["always", "never"]
        }]
    },

    create: function create(context) {
        var multiline = context.options[0] !== "never";

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        /**
         * Tests whether node is preceded by supplied tokens
         * @param {ASTNode} node - node to check
         * @param {ASTNode} parentNode - parent of node to report
         * @param {boolean} expected - whether newline was expected or not
         * @returns {void}
         * @private
         */
        function reportError(node, parentNode, expected) {
            context.report({
                node: node,
                message: "{{expected}} newline between {{typeOfError}} of ternary expression.",
                data: {
                    expected: expected ? "Expected" : "Unexpected",
                    typeOfError: node === parentNode.test ? "test and consequent" : "consequent and alternate"
                }
            });
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            ConditionalExpression: function ConditionalExpression(node) {
                var areTestAndConsequentOnSameLine = _astUtils2.default.isTokenOnSameLine(node.test, node.consequent);
                var areConsequentAndAlternateOnSameLine = _astUtils2.default.isTokenOnSameLine(node.consequent, node.alternate);

                if (!multiline) {
                    if (!areTestAndConsequentOnSameLine) {
                        reportError(node.test, node, false);
                    }

                    if (!areConsequentAndAlternateOnSameLine) {
                        reportError(node.consequent, node, false);
                    }
                } else {
                    if (areTestAndConsequentOnSameLine) {
                        reportError(node.test, node, true);
                    }

                    if (areConsequentAndAlternateOnSameLine) {
                        reportError(node.consequent, node, true);
                    }
                }
            }
        };
    }
};
;
module.exports = exports.default;
