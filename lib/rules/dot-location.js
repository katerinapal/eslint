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
 * @fileoverview Validates newlines before and after dots
 * @author Greg Cochard
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "enforce consistent newlines before and after dots",
            category: "Best Practices",
            recommended: false
        },

        schema: [{
            enum: ["object", "property"]
        }],

        fixable: "code"
    },

    create: function create(context) {

        var config = context.options[0];

        // default to onObject if no preference is passed
        var onObject = config === "object" || !config;

        var sourceCode = context.getSourceCode();

        /**
         * Reports if the dot between object and property is on the correct loccation.
         * @param {ASTNode} obj The object owning the property.
         * @param {ASTNode} prop The property of the object.
         * @param {ASTNode} node The corresponding node of the token.
         * @returns {void}
         */
        function checkDotLocation(obj, prop, node) {
            var dot = sourceCode.getTokenBefore(prop);
            var textBeforeDot = sourceCode.getText().slice(obj.range[1], dot.range[0]);
            var textAfterDot = sourceCode.getText().slice(dot.range[1], prop.range[0]);

            if (dot.type === "Punctuator" && dot.value === ".") {
                if (onObject) {
                    if (!_astUtils2.default.isTokenOnSameLine(obj, dot)) {
                        var neededTextAfterObj = _astUtils2.default.isDecimalInteger(obj) ? " " : "";

                        context.report({
                            node: node,
                            loc: dot.loc.start,
                            message: "Expected dot to be on same line as object.",
                            fix: function fix(fixer) {
                                return fixer.replaceTextRange([obj.range[1], prop.range[0]], neededTextAfterObj + "." + textBeforeDot + textAfterDot);
                            }
                        });
                    }
                } else if (!_astUtils2.default.isTokenOnSameLine(dot, prop)) {
                    context.report({
                        node: node,
                        loc: dot.loc.start,
                        message: "Expected dot to be on same line as property.",
                        fix: function fix(fixer) {
                            return fixer.replaceTextRange([obj.range[1], prop.range[0]], "" + textBeforeDot + textAfterDot + ".");
                        }
                    });
                }
            }
        }

        /**
         * Checks the spacing of the dot within a member expression.
         * @param {ASTNode} node The node to check.
         * @returns {void}
         */
        function checkNode(node) {
            checkDotLocation(node.object, node.property, node);
        }

        return {
            MemberExpression: checkNode
        };
    }
};
;
module.exports = exports.default;
