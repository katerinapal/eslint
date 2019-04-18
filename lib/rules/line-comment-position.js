/**
 * @fileoverview Rule to enforce the position of line comments
 * @author Alberto Rodríguez
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
            description: "enforce position of line comments",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [{
            oneOf: [{
                enum: ["above", "beside"]
            }, {
                type: "object",
                properties: {
                    position: {
                        enum: ["above", "beside"]
                    },
                    ignorePattern: {
                        type: "string"
                    },
                    applyDefaultPatterns: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }]
        }]
    },

    create: function create(context) {
        var DEFAULT_IGNORE_PATTERN = "^\\s*(?:eslint|jshint\\s+|jslint\\s+|istanbul\\s+|globals?\\s+|exported\\s+|jscs|falls?\\s?through)";
        var options = context.options[0];

        var above = void 0,
            ignorePattern = void 0,
            applyDefaultPatterns = true;

        if (!options || typeof options === "string") {
            above = !options || options === "above";
        } else {
            above = options.position === "above";
            ignorePattern = options.ignorePattern;
            applyDefaultPatterns = options.applyDefaultPatterns !== false;
        }

        var defaultIgnoreRegExp = new RegExp(DEFAULT_IGNORE_PATTERN);
        var customIgnoreRegExp = new RegExp(ignorePattern);
        var sourceCode = context.getSourceCode();

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            LineComment: function LineComment(node) {
                if (applyDefaultPatterns && defaultIgnoreRegExp.test(node.value)) {
                    return;
                }

                if (ignorePattern && customIgnoreRegExp.test(node.value)) {
                    return;
                }

                var previous = sourceCode.getTokenOrCommentBefore(node);
                var isOnSameLine = previous && previous.loc.end.line === node.loc.start.line;

                if (above) {
                    if (isOnSameLine) {
                        context.report({
                            node: node,
                            message: "Expected comment to be above code."
                        });
                    }
                } else {
                    if (!isOnSameLine) {
                        context.report({
                            node: node,
                            message: "Expected comment to be beside code."
                        });
                    }
                }
            }
        };
    }
};
;
module.exports = exports.default;
