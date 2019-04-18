/**
 * @fileoverview A rule to disallow negated left operands of the `in` operator
 * @author Michael Ficarra
 * @deprecated in ESLint v3.3.0
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
            description: "disallow negating the left operand in `in` expressions",
            category: "Possible Errors",
            recommended: true,
            replacedBy: ["no-unsafe-negation"]
        },
        deprecated: true,

        schema: []
    },

    create: function create(context) {

        return {
            BinaryExpression: function BinaryExpression(node) {
                if (node.operator === "in" && node.left.type === "UnaryExpression" && node.left.operator === "!") {
                    context.report(node, "The 'in' expression's left operand is negated.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
