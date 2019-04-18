/**
 * @fileoverview Rule to enforce a single linebreak style.
 * @author Erik Mueller
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
            description: "enforce consistent linebreak style",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [{
            enum: ["unix", "windows"]
        }]
    },

    create: function create(context) {

        var EXPECTED_LF_MSG = "Expected linebreaks to be 'LF' but found 'CRLF'.",
            EXPECTED_CRLF_MSG = "Expected linebreaks to be 'CRLF' but found 'LF'.";

        var sourceCode = context.getSourceCode();

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        /**
         * Builds a fix function that replaces text at the specified range in the source text.
         * @param {int[]} range The range to replace
         * @param {string} text The text to insert.
         * @returns {Function} Fixer function
         * @private
         */
        function createFix(range, text) {
            return function (fixer) {
                return fixer.replaceTextRange(range, text);
            };
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            Program: function checkForlinebreakStyle(node) {
                var linebreakStyle = context.options[0] || "unix",
                    expectedLF = linebreakStyle === "unix",
                    expectedLFChars = expectedLF ? "\n" : "\r\n",
                    source = sourceCode.getText(),
                    pattern = /\r\n|\r|\n|\u2028|\u2029/g;
                var match = void 0;

                var i = 0;

                while ((match = pattern.exec(source)) !== null) {
                    i++;
                    if (match[0] === expectedLFChars) {
                        continue;
                    }

                    var index = match.index;
                    var range = [index, index + match[0].length];

                    context.report({
                        node: node,
                        loc: {
                            line: i,
                            column: sourceCode.lines[i - 1].length
                        },
                        message: expectedLF ? EXPECTED_LF_MSG : EXPECTED_CRLF_MSG,
                        fix: createFix(range, expectedLFChars)
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
