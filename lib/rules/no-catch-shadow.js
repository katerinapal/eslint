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
 * @fileoverview Rule to flag variable leak in CatchClauses in IE 8 and earlier
 * @author Ian Christian Myers
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow `catch` clause parameters from shadowing variables in the outer scope",
            category: "Variables",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        /**
         * Check if the parameters are been shadowed
         * @param {Object} scope current scope
         * @param {string} name parameter name
         * @returns {boolean} True is its been shadowed
         */
        function paramIsShadowing(scope, name) {
            return _astUtils2.default.getVariableByName(scope, name) !== null;
        }

        //--------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------

        return {
            CatchClause: function CatchClause(node) {
                var scope = context.getScope();

                // When blockBindings is enabled, CatchClause creates its own scope
                // so start from one upper scope to exclude the current node
                if (scope.block === node) {
                    scope = scope.upper;
                }

                if (paramIsShadowing(scope, node.param.name)) {
                    context.report(node, "Value of '{{name}}' may be overwritten in IE 8 and earlier.", { name: node.param.name });
                }
            }
        };
    }
};
;
module.exports = exports.default;
