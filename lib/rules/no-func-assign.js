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
 * @fileoverview Rule to flag use of function declaration identifiers as variables.
 * @author Ian Christian Myers
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow reassigning `function` declarations",
            category: "Possible Errors",
            recommended: true
        },

        schema: []
    },

    create: function create(context) {

        /**
         * Reports a reference if is non initializer and writable.
         * @param {References} references - Collection of reference to check.
         * @returns {void}
         */
        function checkReference(references) {
            _astUtils2.default.getModifyingReferences(references).forEach(function (reference) {
                context.report(reference.identifier, "'{{name}}' is a function.", { name: reference.identifier.name });
            });
        }

        /**
         * Finds and reports references that are non initializer and writable.
         * @param {Variable} variable - A variable to check.
         * @returns {void}
         */
        function checkVariable(variable) {
            if (variable.defs[0].type === "FunctionName") {
                checkReference(variable.references);
            }
        }

        /**
         * Checks parameters of a given function node.
         * @param {ASTNode} node - A function node to check.
         * @returns {void}
         */
        function checkForFunction(node) {
            context.getDeclaredVariables(node).forEach(checkVariable);
        }

        return {
            FunctionDeclaration: checkForFunction,
            FunctionExpression: checkForFunction
        };
    }
};
;
module.exports = exports.default;
