/**
 * @fileoverview Rule to flag when regex literals are not wrapped in parens
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
            description: "require parenthesis around regex literals",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [],

        fixable: "code"
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();

        return {
            Literal: function Literal(node) {
                var token = sourceCode.getFirstToken(node),
                    nodeType = token.type;

                if (nodeType === "RegularExpression") {
                    var source = sourceCode.getTokenBefore(node);
                    var ancestors = context.getAncestors();
                    var grandparent = ancestors[ancestors.length - 1];

                    if (grandparent.type === "MemberExpression" && grandparent.object === node && (!source || source.value !== "(")) {
                        context.report({
                            node: node,
                            message: "Wrap the regexp literal in parens to disambiguate the slash.",
                            fix: function fix(fixer) {
                                return fixer.replaceText(node, "(" + sourceCode.getText(node) + ")");
                            }
                        });
                    }
                }
            }
        };
    }
};
;
module.exports = exports.default;
