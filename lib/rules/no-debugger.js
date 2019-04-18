/**
 * @fileoverview Rule to flag use of a debugger statement
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default {
    meta: {
        docs: {
            description: "disallow the use of `debugger`",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create(context) {

        return {
            DebuggerStatement(node) {
                context.report(node, "Unexpected 'debugger' statement.");
            }
        };

    }
};;
