'use strict';

var xml2js = require("xml2js");
var parser = xml2js.parseString;

var params = getProcessParameters();

exitOnSignal('SIGTERM');

if (Object.keys(params).length > 0) {
    // custom metadata keys are prefixed with C_
    console.error(' LOCATION: ' + params.C_AGM_LOCATION);
    console.error(' DOMAIN: ' + params.C_DOMAIN);
    console.error(' PROJECT: ' + params.C_PROJECT);
} else {
    console.log('[]');
    process.exit(0);
}

readInputStream(parseXml);

function parseXml (data){
    console.error(' Start parsing agm-issue-change XML');
    parser(data, function(err, result){

        var issue_change = [];
        var elements = result.Audits.Audit.length;
        for(var i = 0; i< elements; i++) {
            var auditEvent = {};
            auditEvent.event = "issue_change";
            //data timestamp is in UTC already, just should be adjusted with ISO-8601
            auditEvent.time = new Date(result.Audits.Audit[i].Time[0]).toISOString();
            //set ID section
            var id = {};
            id.uid =  result.Audits.Audit[i].ParentId[0];
            id.auditId = result.Audits.Audit[i].Id[0];
            auditEvent.id = id;
            //set tags, which are not from metadata
            var tags = {};
            tags.User = result.Audits.Audit[i].User[0];
            tags.Action = result.Audits.Audit[i].Action[0];
            auditEvent.tags = tags;
            var source = {};
            source.Location = params.C_AGM_LOCATION;
            source.Domain = params.C_DOMAIN;
            source.Project = params.C_PROJECT;
            auditEvent.source = source;
            var fi = [];
            //the entire array of Properties, expecting to have length = 1 always
            for(var j = 0; j < result.Audits.Audit[i].Properties.length ; j++){
				var props = result.Audits.Audit[i].Properties[j];
				if (props.Property) //Avoid failure in case of empty Properties section
				{
					fi.push(createFieldFromProperty(props.Property));
				}
            }
            auditEvent.fields = fi[0];

            issue_change.push(auditEvent);
        }
        console.error(' agm issue change payload to be sent to metrics-gateway-service: ' + JSON.stringify(issue_change));
        //use process stdout via console.log to send the result to result-processing (parent process)
        console.log(JSON.stringify(issue_change));
        process.exit(0);
    });
}

/**
 * Create json array from properties object generated by xml parser
 * All properties handled in 1 call of this function
 * Also property names are set according to https://github.com/gaia-adm/api-data-format
 */

var createFieldFromProperty = function createFieldFromProperty(props){
    var fields = [];

    for(var p = 0; p < props.length; p++){
        var field = {};

        field.label = setIfNotEmpty(props[p].$.Label);
        field.name = setIfNotEmpty(props[p].$.Name);
        //oldValue can be empty in case of new entity
        if(props[p].OldValue) {
            field.from = setIfNotEmpty(props[p].OldValue[0]);
        }
        field.to = setIfNotEmpty(props[p].NewValue[0]);
        fields.push(field);
    }
    return fields;
};

var setIfNotEmpty = function setIfNotEmpty(val) {
    if(val) {
        return val;
    }
};

function exitOnSignal(signal) {
    process.on(signal, function() {
        console.error(' Caught ' + signal + ', exiting');
        process.exit(1);
    });
}

function getProcessParameters() {
    var params = {};
    var keys = Object.keys(process.env);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.lastIndexOf('P_', 0) === 0) {
            var value = process.env[key];
            params[key.substr(2)] = value;
        }
    }
    return params;
}

function readInputStream(callback) {
    console.error(' Input stream received, start reading');
    process.stdin.setEncoding('utf8');
    var fullInput = '';
    process.stdin.on('readable', function () {
        var chunk = process.stdin.read();
        if (chunk !== null) {
            console.error('Next chunk size in characters is: ' + chunk.length);
            fullInput = fullInput + chunk;
        }
    });

    process.stdin.on('end', function(){
        if(fullInput.length > 0){
            console.error('XML created from the input stream; size in characters: ' + fullInput.length);
            callback(fullInput);
        }
    });
}

module.exports.setIfNotEmpty = setIfNotEmpty;
module.exports.createFieldFromProperty = createFieldFromProperty;
