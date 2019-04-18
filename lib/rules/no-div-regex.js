/**
 * @fileoverview Rule to check for ambiguous div operator in regexes
 * @author Matt DuVall <http://www.mattduvall.com>
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
            description: "disallow division operators explicitly at the beginning of regular expressions",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();

        return {
            Literal: function Literal(node) {
                var token = sourceCode.getFirstToken(node);

                if (token.type === "RegularExpression" && token.value[1] === "=") {
                    context.report(node, "A regular expression literal can be confused with '/='.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
