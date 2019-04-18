/**
 * @fileoverview Rule to flag statements with function invocation preceded by
 * "new" and not part of assignment
 * @author Ilya Volodin
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
            description: "disallow `new` operators outside of assignments or comparisons",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            ExpressionStatement: function ExpressionStatement(node) {

                if (node.expression.type === "NewExpression") {
                    context.report(node, "Do not use 'new' for side effects.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
