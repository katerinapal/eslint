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
 * @fileoverview A rule to disallow modifying variables of class declarations
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow reassigning class members",
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
                context.report(reference.identifier, "'{{name}}' is a class.", { name: reference.identifier.name });
            });
        }

        /**
         * Finds and reports references that are non initializer and writable.
         * @param {ASTNode} node - A ClassDeclaration/ClassExpression node to check.
         * @returns {void}
         */
        function checkForClass(node) {
            context.getDeclaredVariables(node).forEach(checkVariable);
        }

        return {
            ClassDeclaration: checkForClass,
            ClassExpression: checkForClass
        };
    }
};
;
module.exports = exports.default;
