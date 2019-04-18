/**
 * @fileoverview Rule to flag nested ternary expressions
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
            description: "disallow nested ternary expressions",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            ConditionalExpression: function ConditionalExpression(node) {
                if (node.alternate.type === "ConditionalExpression" || node.consequent.type === "ConditionalExpression") {
                    context.report(node, "Do not nest ternary expressions.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
