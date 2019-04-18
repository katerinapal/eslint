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
 * @fileoverview Rule to flag use of console object
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow the use of `console`",
            category: "Possible Errors",
            recommended: true
        },

        schema: [{
            type: "object",
            properties: {
                allow: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    minItems: 1,
                    uniqueItems: true
                }
            },
            additionalProperties: false
        }]
    },

    create: function create(context) {
        var options = context.options[0] || {};
        var allowed = options.allow || [];

        /**
         * Checks whether the given reference is 'console' or not.
         *
         * @param {escope.Reference} reference - The reference to check.
         * @returns {boolean} `true` if the reference is 'console'.
         */
        function isConsole(reference) {
            var id = reference.identifier;

            return id && id.name === "console";
        }

        /**
         * Checks whether the property name of the given MemberExpression node
         * is allowed by options or not.
         *
         * @param {ASTNode} node - The MemberExpression node to check.
         * @returns {boolean} `true` if the property name of the node is allowed.
         */
        function isAllowed(node) {
            var propertyName = _astUtils2.default.getStaticPropertyName(node);

            return propertyName && allowed.indexOf(propertyName) !== -1;
        }

        /**
         * Checks whether the given reference is a member access which is not
         * allowed by options or not.
         *
         * @param {escope.Reference} reference - The reference to check.
         * @returns {boolean} `true` if the reference is a member access which
         *      is not allowed by options.
         */
        function isMemberAccessExceptAllowed(reference) {
            var node = reference.identifier;
            var parent = node.parent;

            return parent.type === "MemberExpression" && parent.object === node && !isAllowed(parent);
        }

        /**
         * Reports the given reference as a violation.
         *
         * @param {escope.Reference} reference - The reference to report.
         * @returns {void}
         */
        function report(reference) {
            var node = reference.identifier.parent;

            context.report({
                node: node,
                loc: node.loc,
                message: "Unexpected console statement."
            });
        }

        return {
            "Program:exit": function ProgramExit() {
                var scope = context.getScope();
                var consoleVar = _astUtils2.default.getVariableByName(scope, "console");
                var shadowed = consoleVar && consoleVar.defs.length > 0;

                /* 'scope.through' includes all references to undefined
                 * variables. If the variable 'console' is not defined, it uses
                 * 'scope.through'.
                 */
                var references = consoleVar ? consoleVar.references : scope.through.filter(isConsole);

                if (!shadowed) {
                    references.filter(isMemberAccessExceptAllowed).forEach(report);
                }
            }
        };
    }
};
;
module.exports = exports.default;
