/**
 * @fileoverview Ensures that the results of typeof are compared against a valid string
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
            description: "enforce comparing `typeof` expressions against valid strings",
            category: "Possible Errors",
            recommended: true
        },

        schema: [{
            type: "object",
            properties: {
                requireStringLiterals: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {

        var VALID_TYPES = ["symbol", "undefined", "object", "boolean", "number", "string", "function"],
            OPERATORS = ["==", "===", "!=", "!=="];

        var requireStringLiterals = context.options[0] && context.options[0].requireStringLiterals;

        /**
        * Determines whether a node is a typeof expression.
        * @param {ASTNode} node The node
        * @returns {boolean} `true` if the node is a typeof expression
        */
        function isTypeofExpression(node) {
            return node.type === "UnaryExpression" && node.operator === "typeof";
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            UnaryExpression: function UnaryExpression(node) {
                if (isTypeofExpression(node)) {
                    var parent = context.getAncestors().pop();

                    if (parent.type === "BinaryExpression" && OPERATORS.indexOf(parent.operator) !== -1) {
                        var sibling = parent.left === node ? parent.right : parent.left;

                        if (sibling.type === "Literal" || sibling.type === "TemplateLiteral" && !sibling.expressions.length) {
                            var value = sibling.type === "Literal" ? sibling.value : sibling.quasis[0].value.cooked;

                            if (VALID_TYPES.indexOf(value) === -1) {
                                context.report(sibling, "Invalid typeof comparison value.");
                            }
                        } else if (requireStringLiterals && !isTypeofExpression(sibling)) {
                            context.report(sibling, "Typeof comparisons should be to string literals.");
                        }
                    }
                }
            }
        };
    }
};
;
module.exports = exports.default;
