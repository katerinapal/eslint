/**
 * @fileoverview Rule to check for properties whose identifier ends with the string Sync
 * @author Matt DuVall<http://mattduvall.com/>
 */

/* jshint node:true */

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
            description: "disallow synchronous methods",
            category: "Node.js and CommonJS",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        return {
            MemberExpression: function MemberExpression(node) {
                var propertyName = node.property.name,
                    syncRegex = /.*Sync$/;

                if (syncRegex.exec(propertyName) !== null) {
                    context.report({
                        node: node,
                        message: "Unexpected sync method: '{{propertyName}}'.",
                        data: {
                            propertyName: propertyName
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
