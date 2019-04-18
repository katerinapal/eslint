/**
 * @fileoverview A rule to disallow calls to the Object constructor
 * @author Matt DuVall <http://www.mattduvall.com/>
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
            description: "disallow `Object` constructors",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            NewExpression: function NewExpression(node) {
                if (node.callee.name === "Object") {
                    context.report(node, "The object literal notation {} is preferrable.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
