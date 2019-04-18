/**
 * @fileoverview Rule to flag for-in loops without if statements inside
 * @author Nicholas C. Zakas
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
            description: "require `for-in` loops to include an `if` statement",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            ForInStatement: function ForInStatement(node) {

                /*
                 * If the for-in statement has {}, then the real body is the body
                 * of the BlockStatement. Otherwise, just use body as provided.
                 */
                var body = node.body.type === "BlockStatement" ? node.body.body[0] : node.body;

                if (body && body.type !== "IfStatement") {
                    context.report(node, "The body of a for-in should be wrapped in an if statement to filter unwanted properties from the prototype.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
