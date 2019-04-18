/**
 * @fileoverview Rule to disallow an empty pattern
 * @author Alberto Rodríguez
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
            description: "disallow empty destructuring patterns",
            category: "Best Practices",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {
        return {
            ObjectPattern: function ObjectPattern(node) {
                if (node.properties.length === 0) {
                    context.report(node, "Unexpected empty object pattern.");
                }
            },
            ArrayPattern: function ArrayPattern(node) {
                if (node.elements.length === 0) {
                    context.report(node, "Unexpected empty array pattern.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
