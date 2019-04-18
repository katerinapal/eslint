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
 * @fileoverview A rule to disallow modifying variables that are declared using `const`
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow reassigning `const` variables",
            category: "ECMAScript 6",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {

        /**
         * Finds and reports references that are non initializer and writable.
         * @param {Variable} variable - A variable to check.
         * @returns {void}
         */
        function checkVariable(variable) {
            _astUtils2.default.getModifyingReferences(variable.references).forEach(function (reference) {
                context.report(reference.identifier, "'{{name}}' is constant.", { name: reference.identifier.name });
            });
        }

        return {
            VariableDeclaration: function VariableDeclaration(node) {
                if (node.kind === "const") {
                    context.getDeclaredVariables(node).forEach(checkVariable);
                }
            }
        };
    }
};
;
module.exports = exports.default;
