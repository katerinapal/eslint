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
 * @fileoverview Rule to flag labels that are the same as an identifier
 * @author Ian Christian Myers
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow labels that share a name with a variable",
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
         * Check if the identifier is present inside current scope
         * @param {Object} scope current scope
         * @param {string} name To evaluate
         * @returns {boolean} True if its present
         * @private
         */
        function findIdentifier(scope, name) {
            return _astUtils2.default.getVariableByName(scope, name) !== null;
        }

        //--------------------------------------------------------------------------
        // Public API
        //--------------------------------------------------------------------------

        return {
            LabeledStatement: function LabeledStatement(node) {

                // Fetch the innermost scope.
                var scope = context.getScope();

                // Recursively find the identifier walking up the scope, starting
                // with the innermost scope.
                if (findIdentifier(scope, node.label.name)) {
                    context.report(node, "Found identifier with same name as label.");
                }
            }
        };
    }
};
;
module.exports = exports.default;
