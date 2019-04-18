/**
 * @fileoverview Rule to forbid control charactes from regular expressions.
 * @author Nicholas C. Zakas
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
            description: "disallow control characters in regular expressions",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {

        /**
         * Get the regex expression
         * @param {ASTNode} node node to evaluate
         * @returns {*} Regex if found else null
         * @private
         */
        function getRegExp(node) {
            if (node.value instanceof RegExp) {
                return node.value;
            } else if (typeof node.value === "string") {

                var parent = context.getAncestors().pop();

                if ((parent.type === "NewExpression" || parent.type === "CallExpression") && parent.callee.type === "Identifier" && parent.callee.name === "RegExp") {

                    // there could be an invalid regular expression string
                    try {
                        return new RegExp(node.value);
                    } catch (ex) {
                        return null;
                    }
                }
            }

            return null;
        }

        var controlChar = /[\x00-\x1f]/g; // eslint-disable-line no-control-regex
        var consecutiveSlashes = /\\+/g;
        var consecutiveSlashesAtEnd = /\\+$/g;
        var stringControlChar = /\\x[01][0-9a-f]/ig;
        var stringControlCharWithoutSlash = /x[01][0-9a-f]/ig;

        /**
         * Return a list of the control characters in the given regex string
         * @param {string} regexStr regex as string to check
         * @returns {array} returns a list of found control characters on given string
         * @private
         */
        function getControlCharacters(regexStr) {

            // check control characters, if RegExp object used
            var controlChars = regexStr.match(controlChar) || [];

            var stringControlChars = [];

            // check substr, if regex literal used
            var subStrIndex = regexStr.search(stringControlChar);

            if (subStrIndex > -1) {

                // is it escaped, check backslash count
                var possibleEscapeCharacters = regexStr.slice(0, subStrIndex).match(consecutiveSlashesAtEnd);

                var hasControlChars = possibleEscapeCharacters === null || !(possibleEscapeCharacters[0].length % 2);

                if (hasControlChars) {
                    stringControlChars = regexStr.slice(subStrIndex, -1).split(consecutiveSlashes).filter(Boolean).map(function (x) {
                        var match = x.match(stringControlCharWithoutSlash) || [x];

                        return "\\" + match[0];
                    });
                }
            }

            return controlChars.map(function (x) {
                var hexCode = ("0" + x.charCodeAt(0).toString(16)).slice(-2);

                return "\\x" + hexCode;
            }).concat(stringControlChars);
        }

        return {
            Literal: function Literal(node) {
                var regex = getRegExp(node);

                if (regex) {
                    var computedValue = regex.toString();

                    var controlCharacters = getControlCharacters(computedValue);

                    if (controlCharacters.length > 0) {
                        context.report({
                            node: node,
                            message: "Unexpected control character(s) in regular expression: {{controlChars}}.",
                            data: {
                                controlChars: controlCharacters.join(", ")
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
