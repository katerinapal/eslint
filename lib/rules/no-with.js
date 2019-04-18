/**
 * @fileoverview Rule to flag use of with statement
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
            description: "disallow `with` statements",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            WithStatement: function WithStatement(node) {
                context.report(node, "Unexpected use of 'with' statement.");
            }
        };
    }
};
;
module.exports = exports.default;
