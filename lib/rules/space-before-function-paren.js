/**
 * @fileoverview Rule to validate spacing before function paren.
 * @author Mathias Schreck <https://github.com/lo1tuma>
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

exports.default = {
    meta: {
        docs: {
            description: "enforce consistent spacing before `function` definition opening parenthesis",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [{
            oneOf: [{
                enum: ["always", "never"]
            }, {
                type: "object",
                properties: {
                    anonymous: {
                        enum: ["always", "never", "ignore"]
                    },
                    named: {
                        enum: ["always", "never", "ignore"]
                    },
                    asyncArrow: {
                        enum: ["always", "never", "ignore"]
                    }
                },
                additionalProperties: false
            }]
        }]
    },

    create: function create(context) {

        var configuration = context.options[0],
            sourceCode = context.getSourceCode();
        var requireAnonymousFunctionSpacing = true,
            forbidAnonymousFunctionSpacing = false,
            requireNamedFunctionSpacing = true,
            forbidNamedFunctionSpacing = false,
            requireArrowFunctionSpacing = false,
            forbidArrowFunctionSpacing = false;

        if ((typeof configuration === "undefined" ? "undefined" : _typeof(configuration)) === "object") {
            requireAnonymousFunctionSpacing = !configuration.anonymous || configuration.anonymous === "always";
            forbidAnonymousFunctionSpacing = configuration.anonymous === "never";
            requireNamedFunctionSpacing = !configuration.named || configuration.named === "always";
            forbidNamedFunctionSpacing = configuration.named === "never";
            requireArrowFunctionSpacing = configuration.asyncArrow === "always";
            forbidArrowFunctionSpacing = configuration.asyncArrow === "never";
        } else if (configuration === "never") {
            requireAnonymousFunctionSpacing = false;
            forbidAnonymousFunctionSpacing = true;
            requireNamedFunctionSpacing = false;
            forbidNamedFunctionSpacing = true;
        }

        /**
         * Determines whether a function has a name.
         * @param {ASTNode} node The function node.
         * @returns {boolean} Whether the function has a name.
         */
        function isNamedFunction(node) {
            if (node.id) {
                return true;
            }

            var parent = node.parent;

            return parent.type === "MethodDefinition" || parent.type === "Property" && (parent.kind === "get" || parent.kind === "set" || parent.method);
        }

        /**
         * Validates the spacing before function parentheses.
         * @param {ASTNode} node The node to be validated.
         * @returns {void}
         */
        function validateSpacingBeforeParentheses(node) {
            var isArrow = node.type === "ArrowFunctionExpression";
            var isNamed = !isArrow && isNamedFunction(node);
            var isAnonymousGenerator = node.generator && !isNamed;
            var isNormalArrow = isArrow && !node.async;
            var isArrowWithoutParens = isArrow && sourceCode.getFirstToken(node, 1).value !== "(";
            var forbidSpacing = void 0,
                requireSpacing = void 0,
                rightToken = void 0;

            // isAnonymousGenerator → `generator-star-spacing` should warn it. E.g. `function* () {}`
            // isNormalArrow → ignore always.
            // isArrowWithoutParens → ignore always. E.g. `async a => a`
            if (isAnonymousGenerator || isNormalArrow || isArrowWithoutParens) {
                return;
            }

            if (isArrow) {
                forbidSpacing = forbidArrowFunctionSpacing;
                requireSpacing = requireArrowFunctionSpacing;
            } else if (isNamed) {
                forbidSpacing = forbidNamedFunctionSpacing;
                requireSpacing = requireNamedFunctionSpacing;
            } else {
                forbidSpacing = forbidAnonymousFunctionSpacing;
                requireSpacing = requireAnonymousFunctionSpacing;
            }

            rightToken = sourceCode.getFirstToken(node);
            while (rightToken.value !== "(") {
                rightToken = sourceCode.getTokenAfter(rightToken);
            }
            var leftToken = sourceCode.getTokenBefore(rightToken);
            var location = leftToken.loc.end;

            if (sourceCode.isSpaceBetweenTokens(leftToken, rightToken)) {
                if (forbidSpacing) {
                    context.report({
                        node: node,
                        loc: location,
                        message: "Unexpected space before function parentheses.",
                        fix: function fix(fixer) {
                            return fixer.removeRange([leftToken.range[1], rightToken.range[0]]);
                        }
                    });
                }
            } else {
                if (requireSpacing) {
                    context.report({
                        node: node,
                        loc: location,
                        message: "Missing space before function parentheses.",
                        fix: function fix(fixer) {
                            return fixer.insertTextAfter(leftToken, " ");
                        }
                    });
                }
            }
        }

        return {
            FunctionDeclaration: validateSpacingBeforeParentheses,
            FunctionExpression: validateSpacingBeforeParentheses,
            ArrowFunctionExpression: validateSpacingBeforeParentheses
        };
    }
};
;
module.exports = exports.default;
