/**
 * @fileoverview Require or disallow newline at the end of files
 * @author Nodeca Team <https://github.com/nodeca>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
    value: true
});
var lodash = require("lodash");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "require or disallow newline at the end of files",
            category: "Stylistic Issues",
            recommended: false
        },
        fixable: "whitespace",
        schema: [{
            enum: ["always", "never", "unix", "windows"]
        }]
    },
    create: function create(context) {

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            Program: function checkBadEOF(node) {
                var sourceCode = context.getSourceCode(),
                    src = sourceCode.getText(),
                    location = {
                    column: lodash.last(sourceCode.lines).length,
                    line: sourceCode.lines.length
                },
                    LF = "\n",
                    CRLF = "\r" + LF,
                    endsWithNewline = lodash.endsWith(src, LF);

                var mode = context.options[0] || "always",
                    appendCRLF = false;

                if (mode === "unix") {

                    // `"unix"` should behave exactly as `"always"`
                    mode = "always";
                }
                if (mode === "windows") {

                    // `"windows"` should behave exactly as `"always"`, but append CRLF in the fixer for backwards compatibility
                    mode = "always";
                    appendCRLF = true;
                }
                if (mode === "always" && !endsWithNewline) {

                    // File is not newline-terminated, but should be
                    context.report({
                        node: node,
                        loc: location,
                        message: "Newline required at end of file but not found.",
                        fix: function fix(fixer) {
                            return fixer.insertTextAfterRange([0, src.length], appendCRLF ? CRLF : LF);
                        }
                    });
                } else if (mode === "never" && endsWithNewline) {

                    // File is newline-terminated, but shouldn't be
                    context.report({
                        node: node,
                        loc: location,
                        message: "Newline not allowed at end of file.",
                        fix: function fix(fixer) {
                            var finalEOLs = /(?:\r?\n)+$/,
                                match = finalEOLs.exec(sourceCode.text),
                                start = match.index,
                                end = sourceCode.text.length;

                            return fixer.replaceTextRange([start, end], "");
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
