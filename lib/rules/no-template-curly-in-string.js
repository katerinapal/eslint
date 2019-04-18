/**
 * @fileoverview Warn when using template string syntax in regular strings
 * @author Jeroen Engels
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
            description: "disallow template literal placeholder syntax in regular strings",
            category: "Possible Errors",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {
        var regex = /\$\{[^}]+\}/;

        return {
            Literal: function Literal(node) {
                if (typeof node.value === "string" && regex.test(node.value)) {
                    context.report({
                        node: node,
                        message: "Unexpected template string expression."
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
