/**
 * @fileoverview Rule to disallow use of void operator.
 * @author Mike Sidorov
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
            description: "disallow `void` operators",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            UnaryExpression: function UnaryExpression(node) {
                if (node.operator === "void") {
                    context.report(node, "Expected 'undefined' and instead saw 'void'.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
