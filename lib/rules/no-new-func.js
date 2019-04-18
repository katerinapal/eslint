/**
 * @fileoverview Rule to flag when using new Function
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
            description: "disallow `new` operators with the `Function` object",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        /**
         * Checks if the callee is the Function constructor, and if so, reports an issue.
         * @param {ASTNode} node The node to check and report on
         * @returns {void}
         * @private
         */
        function validateCallee(node) {
            if (node.callee.name === "Function") {
                context.report(node, "The Function constructor is eval.");
            }
        }

        return {
            NewExpression: validateCallee,
            CallExpression: validateCallee
        };
    }
};
;
module.exports = exports.default;
