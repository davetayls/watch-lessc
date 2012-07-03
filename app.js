#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var path = require('path');
var less = require('less');

var argv = require('optimist')
    .usage('Usage: {OPTIONS}')
    .wrap(80)
    .option('input', {
      alias: 'i',
      demand: 'i',
      desc: 'Specify input file to watch.'
    })
    .option('output', {
        alias: 'o',
        demand: 'o',
        desc: 'Specify output file path.'
    })
    .option('help', {
      alias: 'h',
      desc: 'Show this message'
    })
    .check(function(argv) {
      if (argv.help) {
        throw '';
      }
    }).argv;

var lessc = function(input, output){
    return function (e, data) {
        if (e) {
            console.log("lessc: " + e.message);
        }

        var parser = new(less.Parser)({
            paths: [path.dirname(input)],
            optimization: 0,
            filename: input
        });

        parser.parse(data, function (err, tree) {
            if (err) {
                less.writeError(err, options);
            } else {
                try {
                    var css = tree.toCSS({ compress: false });
                    if (output) {
                        var fd = fs.openSync(output, "w");
                        fs.writeSync(fd, css, 0, "utf8");
                    } else {
                        util.print(css);
                    }
                } catch (e) {
                    less.writeError(e, options);
                }
            }
        });
    };
};

var input_file = path.resolve(process.cwd(), argv.input);
var output_file = path.resolve(process.cwd(), argv.output);

fs.watchFile(input_file, function(current, previous) {
    console.log("watch-lessc: Updated: " + output_file);
    fs.readFile(input_file, 'utf-8', lessc(input_file, output_file));
});