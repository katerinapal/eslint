"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _astUtils = require("../ast-utils");

var _astUtils2 = _interopRequireDefault(_astUtils);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Rule to flag consistent return values
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks whether or not a given node is an `Identifier` node which was named a given name.
 * @param {ASTNode} node - A node to check.
 * @param {string} name - An expected name of the node.
 * @returns {boolean} `true` if the node is an `Identifier` node which was named as expected.
 */
function isIdentifier(node, name) {
    return node.type === "Identifier" && node.name === name;
}

/**
 * Checks whether or not a given code path segment is unreachable.
 * @param {CodePathSegment} segment - A CodePathSegment to check.
 * @returns {boolean} `true` if the segment is unreachable.
 */
function isUnreachable(segment) {
    return !segment.reachable;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "require `return` statements to either always or never specify values",
            category: "Best Practices",
            recommended: false
        },

        schema: [{
            type: "object",
            properties: {
                treatUndefinedAsUnspecified: {
                    type: "boolean"
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {
        var options = context.options[0] || {};
        var treatUndefinedAsUnspecified = options.treatUndefinedAsUnspecified === true;
        var funcInfo = null;

        /**
         * Checks whether of not the implicit returning is consistent if the last
         * code path segment is reachable.
         *
         * @param {ASTNode} node - A program/function node to check.
         * @returns {void}
         */
        function checkLastSegment(node) {
            var loc = void 0,
                type = void 0;

            /*
             * Skip if it expected no return value or unreachable.
             * When unreachable, all paths are returned or thrown.
             */
            if (!funcInfo.hasReturnValue || funcInfo.codePath.currentSegments.every(isUnreachable) || _astUtils2.default.isES5Constructor(node)) {
                return;
            }

            // Adjust a location and a message.
            if (node.type === "Program") {

                // The head of program.
                loc = { line: 1, column: 0 };
                type = "program";
            } else if (node.type === "ArrowFunctionExpression") {

                // `=>` token
                loc = context.getSourceCode().getTokenBefore(node.body).loc.start;
                type = "function";
            } else if (node.parent.type === "MethodDefinition" || node.parent.type === "Property" && node.parent.method) {

                // Method name.
                loc = node.parent.key.loc.start;
                type = "method";
            } else {

                // Function name or `function` keyword.
                loc = (node.id || node).loc.start;
                type = "function";
            }

            // Reports.
            context.report({
                node: node,
                loc: loc,
                message: "Expected to return a value at the end of this {{type}}.",
                data: { type: type }
            });
        }

        return {

            // Initializes/Disposes state of each code path.
            onCodePathStart: function onCodePathStart(codePath) {
                funcInfo = {
                    upper: funcInfo,
                    codePath: codePath,
                    hasReturn: false,
                    hasReturnValue: false,
                    message: ""
                };
            },
            onCodePathEnd: function onCodePathEnd() {
                funcInfo = funcInfo.upper;
            },

            // Reports a given return statement if it's inconsistent.
            ReturnStatement: function ReturnStatement(node) {
                var argument = node.argument;
                var hasReturnValue = Boolean(argument);

                if (treatUndefinedAsUnspecified && hasReturnValue) {
                    hasReturnValue = !isIdentifier(argument, "undefined") && argument.operator !== "void";
                }

                if (!funcInfo.hasReturn) {
                    funcInfo.hasReturn = true;
                    funcInfo.hasReturnValue = hasReturnValue;
                    funcInfo.message = "Expected {{which}} return value.";
                    funcInfo.data = {
                        which: hasReturnValue ? "a" : "no"
                    };
                } else if (funcInfo.hasReturnValue !== hasReturnValue) {
                    context.report({
                        node: node,
                        message: funcInfo.message,
                        data: funcInfo.data
                    });
                }
            },

            // Reports a given program/function if the implicit returning is not consistent.
            "Program:exit": checkLastSegment,
            "FunctionDeclaration:exit": checkLastSegment,
            "FunctionExpression:exit": checkLastSegment,
            "ArrowFunctionExpression:exit": checkLastSegment
        };
    }
};
;
module.exports = exports.default;
