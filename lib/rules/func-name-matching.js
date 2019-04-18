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
 * @fileoverview Rule to require function names to match the name of the variable or property to which they are assigned.
 * @author Annie Zhang, Pavel Strashkin
 */

"use strict";

var esutils = require("esutils");

//--------------------------------------------------------------------------
// Helpers
//--------------------------------------------------------------------------

/**
 * Determines if a pattern is `module.exports` or `module["exports"]`
 * @param {ASTNode} pattern The left side of the AssignmentExpression
 * @returns {boolean} True if the pattern is `module.exports` or `module["exports"]`
 */
function isModuleExports(pattern) {
    if (pattern.type === "MemberExpression" && pattern.object.type === "Identifier" && pattern.object.name === "module") {

        // module.exports
        if (pattern.property.type === "Identifier" && pattern.property.name === "exports") {
            return true;
        }

        // module["exports"]
        if (pattern.property.type === "Literal" && pattern.property.value === "exports") {
            return true;
        }
    }
    return false;
}

/**
 * Determines if a string name is a valid identifier
 * @param {string} name The string to be checked
 * @param {int} ecmaVersion The ECMAScript version if specified in the parserOptions config
 * @returns {boolean} True if the string is a valid identifier
 */
function isIdentifier(name, ecmaVersion) {
    if (ecmaVersion >= 6) {
        return esutils.keyword.isIdentifierES6(name);
    }
    return esutils.keyword.isIdentifierES5(name);
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var alwaysOrNever = { enum: ["always", "never"] };
var optionsObject = {
    type: "object",
    properties: {
        includeCommonJSModuleExports: {
            type: "boolean"
        }
    },
    additionalProperties: false
};

exports.default = {
    meta: {
        docs: {
            description: "require function names to match the name of the variable or property to which they are assigned",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: {
            anyOf: [{
                type: "array",
                additionalItems: false,
                items: [alwaysOrNever, optionsObject]
            }, {
                type: "array",
                additionalItems: false,
                items: [optionsObject]
            }]
        }
    },

    create: function create(context) {
        var options = (_typeof(context.options[0]) === "object" ? context.options[0] : context.options[1]) || {};
        var nameMatches = typeof context.options[0] === "string" ? context.options[0] : "always";
        var includeModuleExports = options.includeCommonJSModuleExports;
        var ecmaVersion = context.parserOptions && context.parserOptions.ecmaVersion ? context.parserOptions.ecmaVersion : 5;

        /**
         * Compares identifiers based on the nameMatches option
         * @param {string} x the first identifier
         * @param {string} y the second identifier
         * @returns {boolean} whether the two identifiers should warn.
         */
        function shouldWarn(x, y) {
            return nameMatches === "always" && x !== y || nameMatches === "never" && x === y;
        }

        /**
         * Reports
         * @param {ASTNode} node The node to report
         * @param {string} name The variable or property name
         * @param {string} funcName The function name
         * @param {boolean} isProp True if the reported node is a property assignment
         * @returns {void}
         */
        function report(node, name, funcName, isProp) {
            var message = void 0;

            if (nameMatches === "always" && isProp) {
                message = "Function name `{{funcName}}` should match property name `{{name}}`";
            } else if (nameMatches === "always") {
                message = "Function name `{{funcName}}` should match variable name `{{name}}`";
            } else if (isProp) {
                message = "Function name `{{funcName}}` should not match property name `{{name}}`";
            } else {
                message = "Function name `{{funcName}}` should not match variable name `{{name}}`";
            }
            context.report({
                node: node,
                message: message,
                data: {
                    name: name,
                    funcName: funcName
                }
            });
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {
            VariableDeclarator: function VariableDeclarator(node) {
                if (!node.init || node.init.type !== "FunctionExpression") {
                    return;
                }
                if (node.init.id && shouldWarn(node.id.name, node.init.id.name)) {
                    report(node, node.id.name, node.init.id.name, false);
                }
            },
            AssignmentExpression: function AssignmentExpression(node) {
                if (node.right.type !== "FunctionExpression" || node.left.computed && node.left.property.type !== "Literal" || !includeModuleExports && isModuleExports(node.left)) {
                    return;
                }

                var isProp = node.left.type === "MemberExpression" ? true : false;
                var name = isProp ? _astUtils2.default.getStaticPropertyName(node.left) : node.left.name;

                if (node.right.id && isIdentifier(name) && shouldWarn(name, node.right.id.name)) {
                    report(node, name, node.right.id.name, isProp);
                }
            },
            Property: function Property(node) {
                if (node.value.type !== "FunctionExpression" || !node.value.id || node.computed && node.key.type !== "Literal") {
                    return;
                }
                if (node.key.type === "Identifier" && shouldWarn(node.key.name, node.value.id.name)) {
                    report(node, node.key.name, node.value.id.name, true);
                } else if (node.key.type === "Literal" && isIdentifier(node.key.value, ecmaVersion) && shouldWarn(node.key.value, node.value.id.name)) {
                    report(node, node.key.value, node.value.id.name, true);
                }
            }
        };
    }
};
;
module.exports = exports.default;
