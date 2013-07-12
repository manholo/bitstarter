#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
// var sys = require('util');
var url = require('url');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertValidURL = function(inurl) {
    //var inurl = inurl.toString();
    if( url.parse(inurl).host == '') {
        console.log("URL %s seems not valid. Exiting. %s", inurl, url.parse(inurl).host );
        process.exit(1); 
    }
    return inurl;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtml = function(htmldata) {
    return cheerio.load(htmldata);
};


var getDataFromURL = function(url, cont) {
    rest.get(url).on('complete', function(result) {
	if (result instanceof Error) {
	    console.log('Error: ' + result.message);
	    this.retry(5000); 
	} else {
	    cont( result );
	} 
    } ) ;
}

var getDataFromFile = function(file, cont ) {
    cont(fs.readFileSync(file));
}


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlData = function( htmldata, checksfile) {
    $ = cheerioHtml(htmldata);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var checkData = function( htmldata ) {
    var checkJson = checkHtmlData( htmldata, program.checks);  // bad trick here with program.checks
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
    //console.log(htmldata);
    process.exit(0);     
} 

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-h, --url <URL>', 'URL to index.html', clone(assertValidURL), HTMLFILE_DEFAULT)
        .parse(process.argv);

    if (program.file) { getDataFromFile(program.file, checkData ) ; }
    if (program.url)  { getDataFromURL(program.url,   checkData ) ; }


} else {
    exports.checkHtmlFile = checkHtmlFile;
}