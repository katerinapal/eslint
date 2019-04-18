/**
 * @fileoverview Rule to flag use of continue statement
 * @author Borislav Zhivkov
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
            description: "disallow `continue` statements",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            ContinueStatement: function ContinueStatement(node) {
                context.report(node, "Unexpected use of continue statement.");
            }
        };
    }
};
;
module.exports = exports.default;
