/**
 * @fileoverview Rule to flag use of arguments.callee and arguments.caller.
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
            description: "disallow the use of `arguments.caller` or `arguments.callee`",
            category: "Best Practices",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            MemberExpression: function MemberExpression(node) {
                var objectName = node.object.name,
                    propertyName = node.property.name;

                if (objectName === "arguments" && !node.computed && propertyName && propertyName.match(/^calle[er]$/)) {
                    context.report(node, "Avoid arguments.{{property}}.", { property: propertyName });
                }
            }
        };
    }
};
;
module.exports = exports.default;
