/**
 * @fileoverview Rule to enforce a particular function style
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
            description: "enforce the consistent use of either `function` declarations or expressions",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: [{
            enum: ["declaration", "expression"]
        }, {
            type: "object",
            properties: {
                allowArrowFunctions: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {

        var style = context.options[0],
            allowArrowFunctions = context.options[1] && context.options[1].allowArrowFunctions === true,
            enforceDeclarations = style === "declaration",
            stack = [];

        var nodesToCheck = {
            FunctionDeclaration: function FunctionDeclaration(node) {
                stack.push(false);

                if (!enforceDeclarations && node.parent.type !== "ExportDefaultDeclaration") {
                    context.report(node, "Expected a function expression.");
                }
            },
            "FunctionDeclaration:exit": function FunctionDeclarationExit() {
                stack.pop();
            },
            FunctionExpression: function FunctionExpression(node) {
                stack.push(false);

                if (enforceDeclarations && node.parent.type === "VariableDeclarator") {
                    context.report(node.parent, "Expected a function declaration.");
                }
            },
            "FunctionExpression:exit": function FunctionExpressionExit() {
                stack.pop();
            },
            ThisExpression: function ThisExpression() {
                if (stack.length > 0) {
                    stack[stack.length - 1] = true;
                }
            }
        };

        if (!allowArrowFunctions) {
            nodesToCheck.ArrowFunctionExpression = function () {
                stack.push(false);
            };

            nodesToCheck["ArrowFunctionExpression:exit"] = function (node) {
                var hasThisExpr = stack.pop();

                if (enforceDeclarations && !hasThisExpr && node.parent.type === "VariableDeclarator") {
                    context.report(node.parent, "Expected a function declaration.");
                }
            };
        }

        return nodesToCheck;
    }
};
;
module.exports = exports.default;
