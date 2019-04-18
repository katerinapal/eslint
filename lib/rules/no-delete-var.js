/**
 * @fileoverview Rule to flag when deleting variables
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
            description: "disallow deleting variables",
            category: "Variables",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {

        return {
            UnaryExpression: function UnaryExpression(node) {
                if (node.operator === "delete" && node.argument.type === "Identifier") {
                    context.report(node, "Variables should not be deleted.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
