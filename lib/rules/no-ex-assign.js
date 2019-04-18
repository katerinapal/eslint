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
 * @fileoverview Rule to flag assignment of the exception parameter
 * @author Stephen Murray <spmurrayzzz>
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow reassigning exceptions in `catch` clauses",
            category: "Possible Errors",
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
                context.report(reference.identifier, "Do not assign to the exception parameter.");
            });
        }

        return {
            CatchClause: function CatchClause(node) {
                context.getDeclaredVariables(node).forEach(checkVariable);
            }
        };
    }
};
;
module.exports = exports.default;
