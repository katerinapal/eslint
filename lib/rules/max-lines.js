"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _astUtils = require("../ast-utils");

var _astUtils2 = _interopRequireDefault(_astUtils);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview enforce a maximum file length
 * @author Alberto Rodríguez
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var lodash = require("lodash");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "enforce a maximum number of lines per file",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [{
            oneOf: [{
                type: "integer",
                minimum: 0
            }, {
                type: "object",
                properties: {
                    max: {
                        type: "integer",
                        minimum: 0
                    },
                    skipComments: {
                        type: "boolean"
                    },
                    skipBlankLines: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }]
        }]
    },

    create: function create(context) {
        var option = context.options[0];
        var max = 300;

        if ((typeof option === "undefined" ? "undefined" : _typeof(option)) === "object" && option.hasOwnProperty("max") && typeof option.max === "number") {
            max = option.max;
        }

        if (typeof option === "number") {
            max = option;
        }

        var skipComments = option && option.skipComments;
        var skipBlankLines = option && option.skipBlankLines;

        var sourceCode = context.getSourceCode();

        /**
         * Returns whether or not a token is a comment node type
         * @param {Token} token The token to check
         * @returns {boolean} True if the token is a comment node
         */
        function isCommentNodeType(token) {
            return token && (token.type === "Block" || token.type === "Line");
        }

        /**
         * Returns the line numbers of a comment that don't have any code on the same line
         * @param {Node} comment The comment node to check
         * @returns {int[]} The line numbers
         */
        function getLinesWithoutCode(comment) {
            var start = comment.loc.start.line;
            var end = comment.loc.end.line;

            var token = void 0;

            token = comment;
            do {
                token = sourceCode.getTokenOrCommentBefore(token);
            } while (isCommentNodeType(token));

            if (token && _astUtils2.default.isTokenOnSameLine(token, comment)) {
                start += 1;
            }

            token = comment;
            do {
                token = sourceCode.getTokenOrCommentAfter(token);
            } while (isCommentNodeType(token));

            if (token && _astUtils2.default.isTokenOnSameLine(comment, token)) {
                end -= 1;
            }

            if (start <= end) {
                return lodash.range(start, end + 1);
            }
            return [];
        }

        return {
            "Program:exit": function ProgramExit() {
                var lines = sourceCode.lines.map(function (text, i) {
                    return { lineNumber: i + 1, text: text };
                });

                if (skipBlankLines) {
                    lines = lines.filter(function (l) {
                        return l.text.trim() !== "";
                    });
                }

                if (skipComments) {
                    var comments = sourceCode.getAllComments();

                    var commentLines = lodash.flatten(comments.map(function (comment) {
                        return getLinesWithoutCode(comment);
                    }));

                    lines = lines.filter(function (l) {
                        return !lodash.includes(commentLines, l.lineNumber);
                    });
                }

                if (lines.length > max) {
                    context.report({
                        loc: { line: 1, column: 0 },
                        message: "File must be at most {{max}} lines long. It's {{actual}} lines long.",
                        data: {
                            max: max,
                            actual: lines.length
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
