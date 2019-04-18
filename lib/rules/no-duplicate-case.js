/**
 * @fileoverview Rule to disallow a duplicate case label.
 * @author Dieter Oberkofler
 * @author Burak Yigit Kaya
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
            description: "disallow duplicate case labels",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();

        return {
            SwitchStatement: function SwitchStatement(node) {
                var mapping = {};

                node.cases.forEach(function (switchCase) {
                    var key = sourceCode.getText(switchCase.test);

                    if (mapping[key]) {
                        context.report(switchCase, "Duplicate case label.");
                    } else {
                        mapping[key] = switchCase;
                    }
                });
            }
        };
    }
};
;
module.exports = exports.default;
