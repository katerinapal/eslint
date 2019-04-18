/**
 * @fileoverview Rule to flag usage of __proto__ property
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
            description: "disallow the use of the `__proto__` property",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            MemberExpression: function MemberExpression(node) {

                if (node.property && node.property.type === "Identifier" && node.property.name === "__proto__" && !node.computed || node.property.type === "Literal" && node.property.value === "__proto__") {
                    context.report(node, "The '__proto__' property is deprecated.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
