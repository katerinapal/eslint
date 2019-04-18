/**
 * @fileoverview Disallow the use of process.exit()
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
            description: "disallow the use of `process.exit()`",
            category: "Node.js and CommonJS",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            CallExpression: function CallExpression(node) {
                var callee = node.callee;

                if (callee.type === "MemberExpression" && callee.object.name === "process" && callee.property.name === "exit") {
                    context.report(node, "Don't use process.exit(); throw an error instead.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
