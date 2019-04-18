/**
 * @fileoverview Rule to flag use of an object property of the global object (Math and JSON) as a function
 * @author James Allardice
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
            description: "disallow calling global object properties as functions",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {

        return {
            CallExpression: function CallExpression(node) {

                if (node.callee.type === "Identifier") {
                    var name = node.callee.name;

                    if (name === "Math" || name === "JSON") {
                        context.report(node, "'{{name}}' is not a function.", { name: name });
                    }
                }
            }
        };
    }
};
;
module.exports = exports.default;
