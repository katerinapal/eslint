#!/usr/bin/env node
"use strict";

var _cli = require("../lib/cli");

var _cli2 = _interopRequireDefault(_cli);

var _configInitializer = require("../lib/config/config-initializer");

var _configInitializer2 = _interopRequireDefault(_configInitializer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @fileoverview Main CLI that is run via the eslint command.
 * @author Nicholas C. Zakas
 */

/* eslint no-console:off, no-process-exit:off */

"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var useStdIn = process.argv.indexOf("--stdin") > -1,
    init = process.argv.indexOf("--init") > -1,
    debug = process.argv.indexOf("--debug") > -1;

// must do this initialization *before* other requires in order to work
if (debug) {
    require("debug").enable("eslint:*,-eslint:code-path");
}

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// now we can safely include the other modules that use debug
var concat = require("concat-stream"),
    path = require("path"),
    fs = require("fs");

//------------------------------------------------------------------------------
// Execution
//------------------------------------------------------------------------------

process.on("uncaughtException", function (err) {

    // lazy load
    var lodash = require("lodash");

    if (typeof err.messageTemplate === "string" && err.messageTemplate.length > 0) {
        var template = lodash.template(fs.readFileSync(path.resolve(__dirname, "../messages/" + err.messageTemplate + ".txt"), "utf-8"));

        console.log("\nOops! Something went wrong! :(");
        console.log("\n" + template(err.messageData || {}));
    } else {
        console.log(err.message);
        console.log(err.stack);
    }

    process.exit(1);
});

if (useStdIn) {
    process.stdin.pipe(concat({ encoding: "string" }, function (text) {
        process.exitCode = _cli2.default.execute(process.argv, text);
    }));
} else if (init) {
    _configInitializer2.default.initializeConfig(function (err) {
        if (err) {
            process.exitCode = 1;
            console.error(err.message);
            console.error(err.stack);
        } else {
            process.exitCode = 0;
        }
    });
} else {
    process.exitCode = _cli2.default.execute(process.argv);
}
