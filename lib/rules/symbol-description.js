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
 * @fileoverview Rule to enforce description with the `Symbol` object
 * @author Jarek Rencz
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------


exports.default = {
    meta: {
        docs: {
            description: "require symbol descriptions",
            category: "ECMAScript 6",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {

        /**
         * Reports if node does not conform the rule in case rule is set to
         * report missing description
         *
         * @param {ASTNode} node - A CallExpression node to check.
         * @returns {void}
         */
        function checkArgument(node) {
            if (node.arguments.length === 0) {
                context.report({
                    node: node,
                    message: "Expected Symbol to have a description."
                });
            }
        }

        return {
            "Program:exit": function ProgramExit() {
                var scope = context.getScope();
                var variable = _astUtils2.default.getVariableByName(scope, "Symbol");

                if (variable && variable.defs.length === 0) {
                    variable.references.forEach(function (reference) {
                        var node = reference.identifier;

                        if (_astUtils2.default.isCallee(node)) {
                            checkArgument(node.parent);
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
