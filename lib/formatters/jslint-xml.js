"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (results) {

    var output = "";

    output += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
    output += "<jslint>";

    results.forEach(function (result) {
        var messages = result.messages;

        output += "<file name=\"" + result.filePath + "\">";

        messages.forEach(function (message) {
            output += ["<issue line=\"" + message.line + "\"", "char=\"" + message.column + "\"", "evidence=\"" + (0, _xmlEscape2.default)(message.source || "") + "\"", "reason=\"" + (0, _xmlEscape2.default)(message.message || "") + (message.ruleId ? " (" + message.ruleId + ")" : "") + "\" />"].join(" ");
        });

        output += "</file>";
    });

    output += "</jslint>";

    return output;
};

var _xmlEscape = require("../util/xml-escape");

var _xmlEscape2 = _interopRequireDefault(_xmlEscape);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview JSLint XML reporter
 * @author Ian Christian Myers
 */
"use strict";

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

;;
module.exports = exports.default;
