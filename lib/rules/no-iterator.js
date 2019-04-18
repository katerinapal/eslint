/**
 * @fileoverview Rule to flag usage of __iterator__ property
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
            description: "disallow the use of the `__iterator__` property",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            MemberExpression: function MemberExpression(node) {

                if (node.property && node.property.type === "Identifier" && node.property.name === "__iterator__" && !node.computed || node.property.type === "Literal" && node.property.value === "__iterator__") {
                    context.report(node, "Reserved name '__iterator__'.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
