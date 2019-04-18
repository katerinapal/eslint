/**
 * @fileoverview Rule to enforce placing object properties on separate lines.
 * @author Vitor Balocco
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
            description: "enforce placing object properties on separate lines",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [{
            type: "object",
            properties: {
                allowMultiplePropertiesPerLine: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {
        var allowSameLine = context.options[0] && Boolean(context.options[0].allowMultiplePropertiesPerLine);
        var errorMessage = allowSameLine ? "Object properties must go on a new line if they aren't all on the same line." : "Object properties must go on a new line.";

        var sourceCode = context.getSourceCode();

        return {
            ObjectExpression: function ObjectExpression(node) {
                if (allowSameLine) {
                    if (node.properties.length > 1) {
                        var firstTokenOfFirstProperty = sourceCode.getFirstToken(node.properties[0]);
                        var lastTokenOfLastProperty = sourceCode.getLastToken(node.properties[node.properties.length - 1]);

                        if (firstTokenOfFirstProperty.loc.end.line === lastTokenOfLastProperty.loc.start.line) {

                            // All keys and values are on the same line
                            return;
                        }
                    }
                }

                for (var i = 1; i < node.properties.length; i++) {
                    var lastTokenOfPreviousProperty = sourceCode.getLastToken(node.properties[i - 1]);
                    var firstTokenOfCurrentProperty = sourceCode.getFirstToken(node.properties[i]);

                    if (lastTokenOfPreviousProperty.loc.end.line === firstTokenOfCurrentProperty.loc.start.line) {
                        context.report({
                            node: node,
                            loc: firstTokenOfCurrentProperty.loc.start,
                            message: errorMessage
                        });
                    }
                }
            }
        };
    }
};
;
module.exports = exports.default;
