/**
 * @fileoverview Rule to flag when using javascript: urls
 * @author Ilya Volodin
 */
/* jshint scripturl: true */
/* eslint no-script-url: 0 */

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
            description: "disallow `javascript:` urls",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            Literal: function Literal(node) {
                if (node.value && typeof node.value === "string") {
                    var value = node.value.toLowerCase();

                    if (value.indexOf("javascript:") === 0) {
                        context.report(node, "Script URL is a form of eval.");
                    }
                }
            }
        };
    }
};
;
module.exports = exports.default;
