"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _options = require("./options");

var _options2 = _interopRequireDefault(_options);

var _cliEngine = require("./cli-engine");

var _cliEngine2 = _interopRequireDefault(_cliEngine);

var _logging = require("./logging");

var _logging2 = _interopRequireDefault(_logging);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * @fileoverview Main CLI object.
 * @author Nicholas C. Zakas
 */

"use strict";

/*
 * The CLI object should *not* call process.exit() directly. It should only return
 * exit codes. This allows other programs to use the CLI object and still control
 * when the program exits.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var fs = require("fs"),
    path = require("path"),
    shell = require("shelljs"),
    mkdirp = require("mkdirp");

var debug = require("debug")("eslint:cli");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Translates the CLI options into the options expected by the CLIEngine.
 * @param {Object} cliOptions The CLI options to translate.
 * @returns {CLIEngineOptions} The options object for the CLIEngine.
 * @private
 */
function translateOptions(cliOptions) {
    return {
        envs: cliOptions.env,
        extensions: cliOptions.ext,
        rules: cliOptions.rule,
        plugins: cliOptions.plugin,
        globals: cliOptions.global,
        ignore: cliOptions.ignore,
        ignorePath: cliOptions.ignorePath,
        ignorePattern: cliOptions.ignorePattern,
        configFile: cliOptions.config,
        rulePaths: cliOptions.rulesdir,
        useEslintrc: cliOptions.eslintrc,
        parser: cliOptions.parser,
        parserOptions: cliOptions.parserOptions,
        cache: cliOptions.cache,
        cacheFile: cliOptions.cacheFile,
        cacheLocation: cliOptions.cacheLocation,
        fix: cliOptions.fix,
        allowInlineConfig: cliOptions.inlineConfig
    };
}

/**
 * Outputs the results of the linting.
 * @param {CLIEngine} engine The CLIEngine to use.
 * @param {LintResult[]} results The results to print.
 * @param {string} format The name of the formatter to use or the path to the formatter.
 * @param {string} outputFile The path for the output file.
 * @returns {boolean} True if the printing succeeds, false if not.
 * @private
 */
function printResults(engine, results, format, outputFile) {
    var formatter = void 0;

    try {
        formatter = engine.getFormatter(format);
    } catch (e) {
        _logging2.default.error(e.message);
        return false;
    }

    var output = formatter(results);

    if (output) {
        if (outputFile) {
            var filePath = path.resolve(process.cwd(), outputFile);

            if (shell.test("-d", filePath)) {
                _logging2.default.error("Cannot write to output file path, it is a directory: %s", outputFile);
                return false;
            }

            try {
                mkdirp.sync(path.dirname(filePath));
                fs.writeFileSync(filePath, output);
            } catch (ex) {
                _logging2.default.error("There was a problem writing the output file:\n%s", ex);
                return false;
            }
        } else {
            _logging2.default.info(output);
        }
    }

    return true;
}

var cli = {

    /**
     * Executes the CLI based on an array of arguments that is passed in.
     * @param {string|Array|Object} args The arguments to process.
     * @param {string} [text] The text to lint (used for TTY).
     * @returns {int} The exit code for the operation.
     */
    execute: function execute(args, text) {

        var currentOptions = void 0;

        try {
            currentOptions = _options2.default.parse(args);
        } catch (error) {
            _logging2.default.error(error.message);
            return 1;
        }

        var files = currentOptions._;

        if (currentOptions.version) {
            // version from package.json

            _logging2.default.info("v" + require("../package.json").version);
        } else if (currentOptions.printConfig) {
            if (files.length) {
                _logging2.default.error("The --print-config option must be used with exactly one file name.");
                return 1;
            } else if (text) {
                _logging2.default.error("The --print-config option is not available for piped-in code.");
                return 1;
            }

            var engine = new _cliEngine2.default(translateOptions(currentOptions));

            var fileConfig = engine.getConfigForFile(currentOptions.printConfig);

            _logging2.default.info(JSON.stringify(fileConfig, null, "  "));
            return 0;
        } else if (currentOptions.help || !files.length && !text) {

            _logging2.default.info(_options2.default.generateHelp());
        } else {

            debug("Running on " + (text ? "text" : "files"));

            // disable --fix for piped-in code until we know how to do it correctly
            if (text && currentOptions.fix) {
                _logging2.default.error("The --fix option is not available for piped-in code.");
                return 1;
            }

            var _engine = new _cliEngine2.default(translateOptions(currentOptions));

            var report = text ? _engine.executeOnText(text, currentOptions.stdinFilename, true) : _engine.executeOnFiles(files);

            if (currentOptions.fix) {
                debug("Fix mode enabled - applying fixes");
                _cliEngine2.default.outputFixes(report);
            }

            if (currentOptions.quiet) {
                debug("Quiet mode enabled - filtering out warnings");
                report.results = _cliEngine2.default.getErrorResults(report.results);
            }

            if (printResults(_engine, report.results, currentOptions.format, currentOptions.outputFile)) {
                var tooManyWarnings = currentOptions.maxWarnings >= 0 && report.warningCount > currentOptions.maxWarnings;

                if (!report.errorCount && tooManyWarnings) {
                    _logging2.default.error("ESLint found too many warnings (maximum: %s).", currentOptions.maxWarnings);
                }

                return report.errorCount || tooManyWarnings ? 1 : 0;
            } else {
                return 1;
            }
        }

        return 0;
    }
};

exports.default = cli;
module.exports = exports.default;
