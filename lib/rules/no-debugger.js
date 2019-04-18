/**
 * @fileoverview Rule to flag use of a debugger statement
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
            description: "disallow the use of `debugger`",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {

        return {
            DebuggerStatement: function DebuggerStatement(node) {
                context.report(node, "Unexpected 'debugger' statement.");
            }
        };
    }
};
;
module.exports = exports.default;
