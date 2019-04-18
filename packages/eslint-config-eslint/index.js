/**
 * @fileoverview Converts YAML file into JSON.
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

Object.defineProperty(exports, "__esModule", {
    value: true
});
var fs = require("fs"),
    path = require("path"),
    yaml = require("js-yaml");

//------------------------------------------------------------------------------
// Bootstrapping
//------------------------------------------------------------------------------

var filePath = path.resolve(__dirname, "./default.yml"),
    config;

try {
    config = yaml.safeLoad(fs.readFileSync(filePath, "utf8")) || {};
} catch (e) {
    console.error("Error reading YAML file: " + filePath);
    e.message = "Cannot read config file: " + filePath + "\nError: " + e.message;
    throw e;
}

exports.default = config;
module.exports = exports.default;
