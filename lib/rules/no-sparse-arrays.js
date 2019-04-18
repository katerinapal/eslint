/**
 * @fileoverview Disallow sparse arrays
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
            description: "disallow sparse arrays",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            ArrayExpression: function ArrayExpression(node) {

                var emptySpot = node.elements.indexOf(null) > -1;

                if (emptySpot) {
                    context.report(node, "Unexpected comma in middle of array.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
