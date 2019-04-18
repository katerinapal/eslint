/**
 * @fileoverview Rule to flag when initializing octal literal
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
            description: "disallow octal literals",
            category: "Best Practices",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {

        return {
            Literal: function Literal(node) {
                if (typeof node.value === "number" && /^0[0-7]/.test(node.raw)) {
                    context.report(node, "Octal literals should not be used.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
