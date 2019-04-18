/**
 * @fileoverview Compact reporter
 * @author Nicholas C. Zakas
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

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (results) {

    var output = "",
        total = 0;

    results.forEach(function (result) {

        var messages = result.messages;

        total += messages.length;

        messages.forEach(function (message) {

            output += result.filePath + ": ";
            output += "line " + (message.line || 0);
            output += ", col " + (message.column || 0);
            output += ", " + getMessageType(message);
            output += " - " + message.message;
            output += message.ruleId ? " (" + message.ruleId + ")" : "";
            output += "\n";
        });
    });

    if (total > 0) {
        output += "\n" + total + " problem" + (total !== 1 ? "s" : "");
    }

    return output;
};

function getMessageType(message) {
    if (message.fatal || message.severity === 2) {
        return "Error";
    } else {
        return "Warning";
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
