"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (results) {

    var output = "";

    output += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
    output += "<checkstyle version=\"4.3\">";

    results.forEach(function (result) {
        var messages = result.messages;

        output += "<file name=\"" + (0, _xmlEscape2.default)(result.filePath) + "\">";

        messages.forEach(function (message) {
            output += ["<error line=\"" + (0, _xmlEscape2.default)(message.line) + "\"", "column=\"" + (0, _xmlEscape2.default)(message.column) + "\"", "severity=\"" + (0, _xmlEscape2.default)(getMessageType(message)) + "\"", "message=\"" + (0, _xmlEscape2.default)(message.message) + (message.ruleId ? " (" + message.ruleId + ")" : "") + "\"", "source=\"" + (message.ruleId ? (0, _xmlEscape2.default)("eslint.rules." + message.ruleId) : "") + "\" />"].join(" ");
        });

        output += "</file>";
    });

    output += "</checkstyle>";

    return output;
};

var _xmlEscape = require("../util/xml-escape");

var _xmlEscape2 = _interopRequireDefault(_xmlEscape);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview CheckStyle XML reporter
 * @author Ian Christian Myers
 */
"use strict";

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

/**
 * Returns the severity of warning or error
 * @param {Object} message message object to examine
 * @returns {string} severity level
 * @private
 */
function getMessageType(message) {
    if (message.fatal || message.severity === 2) {
        return "error";
    } else {
        return "warning";
    }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

;;
module.exports = exports.default;
