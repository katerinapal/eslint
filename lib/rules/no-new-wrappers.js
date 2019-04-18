/**
 * @fileoverview Rule to flag when using constructor for wrapper objects
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
            description: "disallow `new` operators with the `String`, `Number`, and `Boolean` objects",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            NewExpression: function NewExpression(node) {
                var wrapperObjects = ["String", "Number", "Boolean", "Math", "JSON"];

                if (wrapperObjects.indexOf(node.callee.name) > -1) {
                    context.report(node, "Do not use {{fn}} as a constructor.", { fn: node.callee.name });
                }
            }
        };
    }
};
;
module.exports = exports.default;
