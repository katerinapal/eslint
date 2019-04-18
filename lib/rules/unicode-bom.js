/**
 * @fileoverview Require or disallow Unicode BOM
 * @author Andrew Johnston <https://github.com/ehjay>
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
            description: "require or disallow Unicode byte order mark (BOM)",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [{
            enum: ["always", "never"]
        }]
    },

    create: function create(context) {

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            Program: function checkUnicodeBOM(node) {

                var sourceCode = context.getSourceCode(),
                    location = { column: 0, line: 1 },
                    requireBOM = context.options[0] || "never";

                if (!sourceCode.hasBOM && requireBOM === "always") {
                    context.report({
                        node: node,
                        loc: location,
                        message: "Expected Unicode BOM (Byte Order Mark).",
                        fix: function fix(fixer) {
                            return fixer.insertTextBefore(node, "\uFEFF");
                        }
                    });
                } else if (sourceCode.hasBOM && requireBOM === "never") {
                    context.report({
                        node: node,
                        loc: location,
                        message: "Unexpected Unicode BOM (Byte Order Mark).",
                        fix: function fix(fixer) {
                            return fixer.removeRange([-1, 0]);
                        }
                    });
                }
            }

        };
    }
};
;
module.exports = exports.default;
