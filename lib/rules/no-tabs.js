/**
 * @fileoverview Rule to check for tabs inside a file
 * @author Gyandeep Singh
 */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
    value: true
});
var regex = /\t/;

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow tabs in file",
            category: "Stylistic Issues",
            recommended: false
        },
        schema: []
    },

    create: function create(context) {
        return {
            Program: function Program(node) {
                context.getSourceLines().forEach(function (line, index) {
                    var match = regex.exec(line);

                    if (match) {
                        context.report(node, {
                            line: index + 1,
                            column: match.index + 1
                        }, "Unexpected tab character.");
                    }
                });
            }
        };
    }
};
;
module.exports = exports.default;
