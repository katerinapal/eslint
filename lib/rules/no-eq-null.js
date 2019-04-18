/**
 * @fileoverview Rule to flag comparisons to null without a type-checking
 * operator.
 * @author Ian Christian Myers
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    meta: {
        docs: {
            description: "disallow `null` comparisons without type-checking operators",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            BinaryExpression: function BinaryExpression(node) {
                var badOperator = node.operator === "==" || node.operator === "!=";

                if (node.right.type === "Literal" && node.right.raw === "null" && badOperator || node.left.type === "Literal" && node.left.raw === "null" && badOperator) {
                    context.report(node, "Use ‘===’ to compare with ‘null’.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
