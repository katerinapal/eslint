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
 * @fileoverview Rule to enforce spacing around embedded expressions of template strings
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var OPEN_PAREN = /\$\{$/;
var CLOSE_PAREN = /^\}/;

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "require or disallow spacing around embedded expressions of template strings",
            category: "ECMAScript 6",
            recommended: false
        },

        fixable: "whitespace",

        schema: [{ enum: ["always", "never"] }]
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();
        var always = context.options[0] === "always";
        var prefix = always ? "Expected" : "Unexpected";

        /**
         * Checks spacing before `}` of a given token.
         * @param {Token} token - A token to check. This is a Template token.
         * @returns {void}
         */
        function checkSpacingBefore(token) {
            var prevToken = sourceCode.getTokenBefore(token);

            if (prevToken && CLOSE_PAREN.test(token.value) && _astUtils2.default.isTokenOnSameLine(prevToken, token) && sourceCode.isSpaceBetweenTokens(prevToken, token) !== always) {
                context.report({
                    loc: token.loc.start,
                    message: "{{prefix}} space(s) before '}'.",
                    data: {
                        prefix: prefix
                    },
                    fix: function fix(fixer) {
                        if (always) {
                            return fixer.insertTextBefore(token, " ");
                        }
                        return fixer.removeRange([prevToken.range[1], token.range[0]]);
                    }
                });
            }
        }

        /**
         * Checks spacing after `${` of a given token.
         * @param {Token} token - A token to check. This is a Template token.
         * @returns {void}
         */
        function checkSpacingAfter(token) {
            var nextToken = sourceCode.getTokenAfter(token);

            if (nextToken && OPEN_PAREN.test(token.value) && _astUtils2.default.isTokenOnSameLine(token, nextToken) && sourceCode.isSpaceBetweenTokens(token, nextToken) !== always) {
                context.report({
                    loc: {
                        line: token.loc.end.line,
                        column: token.loc.end.column - 2
                    },
                    message: "{{prefix}} space(s) after '${'.",
                    data: {
                        prefix: prefix
                    },
                    fix: function fix(fixer) {
                        if (always) {
                            return fixer.insertTextAfter(token, " ");
                        }
                        return fixer.removeRange([token.range[1], nextToken.range[0]]);
                    }
                });
            }
        }

        return {
            TemplateElement: function TemplateElement(node) {
                var token = sourceCode.getFirstToken(node);

                checkSpacingBefore(token);
                checkSpacingAfter(token);
            }
        };
    }
};
;
module.exports = exports.default;
