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
 * @fileoverview A rule to ensure consistent quotes used in jsx syntax.
 * @author Mathias Schreck <https://github.com/lo1tuma>
 */

"use strict";

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var QUOTE_SETTINGS = {
    "prefer-double": {
        quote: "\"",
        description: "singlequote",
        convert: function convert(str) {
            return str.replace(/'/g, "\"");
        }
    },
    "prefer-single": {
        quote: "'",
        description: "doublequote",
        convert: function convert(str) {
            return str.replace(/"/g, "'");
        }
    }
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "enforce the consistent use of either double or single quotes in JSX attributes",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [{
            enum: ["prefer-single", "prefer-double"]
        }]
    },

    create: function create(context) {
        var quoteOption = context.options[0] || "prefer-double",
            setting = QUOTE_SETTINGS[quoteOption];

        /**
         * Checks if the given string literal node uses the expected quotes
         * @param {ASTNode} node - A string literal node.
         * @returns {boolean} Whether or not the string literal used the expected quotes.
         * @public
         */
        function usesExpectedQuotes(node) {
            return node.value.indexOf(setting.quote) !== -1 || _astUtils2.default.isSurroundedBy(node.raw, setting.quote);
        }

        return {
            JSXAttribute: function JSXAttribute(node) {
                var attributeValue = node.value;

                if (attributeValue && _astUtils2.default.isStringLiteral(attributeValue) && !usesExpectedQuotes(attributeValue)) {
                    context.report({
                        node: attributeValue,
                        message: "Unexpected usage of {{description}}.",
                        data: {
                            description: setting.description
                        },
                        fix: function fix(fixer) {
                            return fixer.replaceText(attributeValue, setting.convert(attributeValue.raw));
                        }
                    });
                }
            }
        };
    }
};
;
module.exports = exports.default;
