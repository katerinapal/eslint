/**
 * @fileoverview Rule to flag use of ternary operators.
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
            description: "disallow ternary operators",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            ConditionalExpression: function ConditionalExpression(node) {
                context.report(node, "Ternary operator used.");
            }
        };
    }
};
;
module.exports = exports.default;
