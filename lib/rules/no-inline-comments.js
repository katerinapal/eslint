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
 * @fileoverview Enforces or disallows inline comments.
 * @author Greg Cochard
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

exports.default = {
    meta: {
        docs: {
            description: "disallow inline comments after code",
            category: "Stylistic Issues",
            recommended: false
        },

        schema: []
    },

    create: function create(context) {
        var sourceCode = context.getSourceCode();

        /**
         * Will check that comments are not on lines starting with or ending with code
         * @param {ASTNode} node The comment node to check
         * @private
         * @returns {void}
         */
        function testCodeAroundComment(node) {

            // Get the whole line and cut it off at the start of the comment
            var startLine = String(sourceCode.lines[node.loc.start.line - 1]);
            var endLine = String(sourceCode.lines[node.loc.end.line - 1]);

            var preamble = startLine.slice(0, node.loc.start.column).trim();

            // Also check after the comment
            var postamble = endLine.slice(node.loc.end.column).trim();

            // Check that this comment isn't an ESLint directive
            var isDirective = _astUtils2.default.isDirectiveComment(node);

            // Should be empty if there was only whitespace around the comment
            if (!isDirective && (preamble || postamble)) {
                context.report(node, "Unexpected comment inline with code.");
            }
        }

        //--------------------------------------------------------------------------
        // Public
        //--------------------------------------------------------------------------

        return {

            LineComment: testCodeAroundComment,
            BlockComment: testCodeAroundComment

        };
    }
};
;
module.exports = exports.default;
