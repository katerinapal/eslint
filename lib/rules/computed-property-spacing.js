"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _astUtils = require("../ast-utils");

var _astUtils2 = _interopRequireDefault(_astUtils);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Disallows or enforces spaces inside computed properties.
 * @author Jamund Ferguson
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "enforce consistent spacing inside computed property brackets",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [{
            enum: ["always", "never"]
        }]
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();
        var propertyNameMustBeSpaced = context.options[0] === "always"; // default is "never"

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        /**
        * Reports that there shouldn't be a space after the first token
        * @param {ASTNode} node - The node to report in the event of an error.
        * @param {Token} token - The token to use for the report.
        * @param {Token} tokenAfter - The token after `token`.
        * @returns {void}
        */
        function reportNoBeginningSpace(node, token, tokenAfter) {
            context.report({
                node: node,
                loc: token.loc.start,
                message: "There should be no space after '{{tokenValue}}'.",
                data: {
                    tokenValue: token.value
                },
                fix: function fix(fixer) {
                    return fixer.removeRange([token.range[1], tokenAfter.range[0]]);
                }
            });
        }

        /**
        * Reports that there shouldn't be a space before the last token
        * @param {ASTNode} node - The node to report in the event of an error.
        * @param {Token} token - The token to use for the report.
        * @param {Token} tokenBefore - The token before `token`.
        * @returns {void}
        */
        function reportNoEndingSpace(node, token, tokenBefore) {
            context.report({
                node: node,
                loc: token.loc.start,
                message: "There should be no space before '{{tokenValue}}'.",
                data: {
                    tokenValue: token.value
                },
                fix: function fix(fixer) {
                    return fixer.removeRange([tokenBefore.range[1], token.range[0]]);
                }
            });
        }

        /**
        * Reports that there should be a space after the first token
        * @param {ASTNode} node - The node to report in the event of an error.
        * @param {Token} token - The token to use for the report.
        * @returns {void}
        */
        function reportRequiredBeginningSpace(node, token) {
            context.report({
                node: node,
                loc: token.loc.start,
                message: "A space is required after '{{tokenValue}}'.",
                data: {
                    tokenValue: token.value
                },
                fix: function fix(fixer) {
                    return fixer.insertTextAfter(token, " ");
                }
            });
        }

        /**
        * Reports that there should be a space before the last token
        * @param {ASTNode} node - The node to report in the event of an error.
        * @param {Token} token - The token to use for the report.
        * @returns {void}
        */
        function reportRequiredEndingSpace(node, token) {
            context.report({
                node: node,
                loc: token.loc.start,
                message: "A space is required before '{{tokenValue}}'.",
                data: {
                    tokenValue: token.value
                },
                fix: function fix(fixer) {
                    return fixer.insertTextBefore(token, " ");
                }
            });
        }

        /**
         * Returns a function that checks the spacing of a node on the property name
         * that was passed in.
         * @param {string} propertyName The property on the node to check for spacing
         * @returns {Function} A function that will check spacing on a node
         */
        function checkSpacing(propertyName) {
            return function (node) {
                if (!node.computed) {
                    return;
                }

                var property = node[propertyName];

                var before = sourceCode.getTokenBefore(property),
                    first = sourceCode.getFirstToken(property),
                    last = sourceCode.getLastToken(property),
                    after = sourceCode.getTokenAfter(property);

                if (_astUtils2.default.isTokenOnSameLine(before, first)) {
                    if (propertyNameMustBeSpaced) {
                        if (!sourceCode.isSpaceBetweenTokens(before, first) && _astUtils2.default.isTokenOnSameLine(before, first)) {
                            reportRequiredBeginningSpace(node, before);
                        }
                    } else {
                        if (sourceCode.isSpaceBetweenTokens(before, first)) {
                            reportNoBeginningSpace(node, before, first);
                        }
                    }
                }

                if (_astUtils2.default.isTokenOnSameLine(last, after)) {
                    if (propertyNameMustBeSpaced) {
                        if (!sourceCode.isSpaceBetweenTokens(last, after) && _astUtils2.default.isTokenOnSameLine(last, after)) {
                            reportRequiredEndingSpace(node, after);
                        }
                    } else {
                        if (sourceCode.isSpaceBetweenTokens(last, after)) {
                            reportNoEndingSpace(node, after, last);
                        }
                    }
                }
            };
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            Property: checkSpacing("key"),
            MemberExpression: checkSpacing("property")
        };
    }
};
;
module.exports = exports.default;
