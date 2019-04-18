/**
 * @fileoverview Rule to flag octal escape sequences in string literals.
 * @author Ian Christian Myers
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
            description: "disallow octal escape sequences in string literals",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            Literal: function Literal(node) {
                if (typeof node.value !== "string") {
                    return;
                }

                var match = node.raw.match(/^([^\\]|\\[^0-7])*\\([0-3][0-7]{1,2}|[4-7][0-7]|[0-7])/);

                if (match) {
                    var octalDigit = match[2];

                    // \0 is actually not considered an octal
                    if (match[2] !== "0" || typeof match[3] !== "undefined") {
                        context.report(node, "Don't use octal: '\\{{octalDigit}}'. Use '\\u....' instead.", { octalDigit: octalDigit });
                    }
                }
            }
        };
    }
};
;
module.exports = exports.default;
