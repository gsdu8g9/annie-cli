var Readable = require("stream").Readable,
    Writable = require("stream").Writable,
    AnnieCliCommand = require("annie-cli-command");

/**
 * @constructor
 */
function AnnieCli() {

}

/**
 * Create a command using the provided options.
 * @param {Readable} [input]
 * @param {Writable} [output]
 * @param {Writable} [error]
 * @param {array} [argv]
 * @returns {AnnieCliCommand}
 */
AnnieCli.createCommand = function(input, output, error, argv) {
    var args = Array.prototype.slice.call(arguments);
       
    input = args[0] instanceof Readable ? args.shift() : process.stdin;
    argv = args.slice(-1).pop() instanceof Writable ? args.pop() : process.argv;
    output = args.length > 1 ? args.shift() : process.stdout;
    error = args.shift() || process.stderr;
    
    return new AnnieCliCommand(argv, input, output, error);
}

/** export AnnieCli class */
module.exports = AnnieCli;
