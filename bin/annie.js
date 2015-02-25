#!/usr/bin/env node
var util = require("util"),
    statuses = require("http").STATUS_CODES,
    annie = require("annie-lib"),
    annieCli = require(".."),
    command = annieCli.createCommand(),
    argparser = require("squabble").createParser(),
    args,
    result;

// set up argument parser
argparser
    .optional("METHOD")
    .required("URL")
    .flag("-j", "--json")
    .flag("-f", "--form")
    .flag("-")
    .option("-t", "--type")
    .option("-o", "--output")
    .list("-H", "--head")
    .list("-D", "--data")
    .count("-v", "--verbose")
    .shortOpts()
    .longOpts();

// handle args
try {
    args = argparser.parse();

    // URL is present or arg parser would have choked
    command.setUrl(args.named.URL);

    // set method if provided; default will be GET
    if (args.named.METHOD) command.setMethod(args.named.METHOD);

    // --json is the same as -tjson -HContent-Type:application/json
    if (args.named["--json"]) {
        args.set(["-t", "--type"], "json");
        args.named["--head"].push("Content-Type:application/json");
    }
    
    // --form is the same as -tform -HContent-Type:application/x-www-form-urlencoded
    if (args.named["--form"]) {
        args.set(["-t", "--type"], "form");
        args.named["--head"].push("Content-Type:application/x-www-form-urlencoded");
    }
    
    // --type determines how data is parsed
    if (args.named["--type"]) command.setDataType(args.named["--type"]);
    
    // set headers from --head
    args.named["--head"].forEach(function(header) {command.addHeader(header);});
    
    // set data from --data
    args.named["--data"].forEach(function(data) {command.setData(data);});
    
    // set log level from --verbose
    command.logLevel = args.named["--verbose"];
    
    // this function will handle the response
    function ready(response) {
        switch (args.named["--output"]) {
            case "stat":
                console.log(response.status);
                break;
            case "head":
                console.log(response.statusLine);
                console.log(response.getHeaderString());
                break;
            case "headers":
                console.log(response.getHeaderString());
                break;
            case "body":
                console.log(response.data);
                break;
            case "status":
                console.log(response.statusLine);
                break;
            case "full":
                console.log(response.statusLine);
                console.log(response.getHeaderString());
                console.log(response.data);
                break;
            case "auto":
            case false:
                if (response.data) console.log(response.data);
                else {
                    console.log(response.statusLine);
                    console.log(response.getHeaderString());
                }
                break;
            default:
                throw new Error("unrecognized argument " + args.named["-o"]);
        }
    }
    
    // check for data on stdin
    if (args.named["-"]) {
        var data = "", rl;
            
        rl = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        }).on("line", function(line) {
            data += line + "\n";
        }).on("close", function() {
            var result;

            command.setData(data);
            command.execute()
                .then(ready)
                .catch(console.error.bind(console));
        });
        
        rl.setPrompt("");
        rl.prompt();
    }
    
    // or just execute
    else command.execute()
        .then(ready)
        .catch(console.error.bind(console));
} catch (e) {
    console.error(e.message);
}

