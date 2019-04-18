/**
 * @fileoverview Rule to flag adding properties to native object's prototypes.
 * @author David Nelson
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
    value: true
});
var globals = require("globals");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow extending native types",
            category: "Best Practices",
            recommended: false
        },

        schema: [{
            type: "object",
            properties: {
                exceptions: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    uniqueItems: true
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {

        var config = context.options[0] || {};
        var exceptions = config.exceptions || [];
        var modifiedBuiltins = Object.keys(globals.builtin).filter(function (builtin) {
            return builtin[0].toUpperCase() === builtin[0];
        });

        if (exceptions.length) {
            modifiedBuiltins = modifiedBuiltins.filter(function (builtIn) {
                return exceptions.indexOf(builtIn) === -1;
            });
        }

        return {

            // handle the Array.prototype.extra style case
            AssignmentExpression: function AssignmentExpression(node) {
                var lhs = node.left;

                if (lhs.type !== "MemberExpression" || lhs.object.type !== "MemberExpression") {
                    return;
                }

                var affectsProto = lhs.object.computed ? lhs.object.property.type === "Literal" && lhs.object.property.value === "prototype" : lhs.object.property.name === "prototype";

                if (!affectsProto) {
                    return;
                }

                modifiedBuiltins.forEach(function (builtin) {
                    if (lhs.object.object.name === builtin) {
                        context.report({
                            node: node,
                            message: "{{builtin}} prototype is read only, properties should not be added.",
                            data: {
                                builtin: builtin
                            }
                        });
                    }
                });
            },

            // handle the Object.definePropert[y|ies](Array.prototype) case
            CallExpression: function CallExpression(node) {

                var callee = node.callee;

                // only worry about Object.definePropert[y|ies]
                if (callee.type === "MemberExpression" && callee.object.name === "Object" && (callee.property.name === "defineProperty" || callee.property.name === "defineProperties")) {

                    // verify the object being added to is a native prototype
                    var subject = node.arguments[0];
                    var object = subject && subject.object;

                    if (object && object.type === "Identifier" && modifiedBuiltins.indexOf(object.name) > -1 && subject.property.name === "prototype") {

                        context.report({
                            node: node,
                            message: "{{objectName}} prototype is read only, properties should not be added.",
                            data: {
                                objectName: object.name
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
