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
 * @fileoverview Rule to flag when initializing to undefined
 * @author Ilya Volodin
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow initializing variables to `undefined`",
            category: "Variables",
            recommended: false
        },

        schema: [],

        fixable: "code"
    },

    create: function create(context) {

        var sourceCode = context.getSourceCode();

        return {
            VariableDeclarator: function VariableDeclarator(node) {
                var name = sourceCode.getText(node.id),
                    init = node.init && node.init.name,
                    scope = context.getScope(),
                    undefinedVar = _astUtils2.default.getVariableByName(scope, "undefined"),
                    shadowed = undefinedVar && undefinedVar.defs.length > 0;

                if (init === "undefined" && node.parent.kind !== "const" && !shadowed) {
                    context.report({
                        node: node,
                        message: "It's not necessary to initialize '{{name}}' to undefined.",
                        data: { name: name },
                        fix: function fix(fixer) {
                            if (node.id.type === "ArrayPattern" || node.id.type === "ObjectPattern") {

                                // Don't fix destructuring assignment to `undefined`.
                                return null;
                            }
                            return fixer.removeRange([node.id.range[1], node.range[1]]);
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
