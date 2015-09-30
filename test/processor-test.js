'use strict';

process.env.P_C_AGM_LOCATION = 'http://localhost:8082';
process.env.P_C_DOMAIN = 'Default';
process.env.P_C_PROJECT = 'ProjectNumberOne';

var assert = require('assert');
var pr = require('./../processor');
var xml2js = require("xml2js");
var parser = xml2js.parseString;

describe('processor-test', function () {

    describe('#setIfNotEmpty()', function () {
        it('not-empty', function () {
            assert.equal(pr.setIfNotEmpty('ddd'), 'ddd', 'should be ddd');
        });
        it('empty-string', function () {
            assert.equal(pr.setIfNotEmpty(''), null, 'should return null');
        });
        it('nothing', function () {
            assert.equal(pr.setIfNotEmpty(), null, 'should return null');
        });

    });

    describe('#createFieldFromProperty()', function () {
		//single property xml example: '<Properties><Property Label="Severity" Name="severity"><NewValue>3-High</NewValue><OldValue>2-Medium</OldValue></Property></Properties>';
        it('regularProperty', function () {

            var prop = pr.createFieldFromProperty(createPropertyObject('Severity', 'severity', '3-High', '2-Medium'));
            assert.strictEqual(prop.constructor, Array, 'prop must be an array');
            assert.equal(prop.length, 1, 'prop array must have 1 element');
            assert.equal(prop[0].from, '2-Medium', 'old value becomes "from" and keeps the correct value');
            assert.equal(prop[0].to, '3-High', 'new value becomes "to" and keeps the correct value');
            assert.equal(prop[0].label, 'Severity', 'label is correct');
            assert.equal(prop[0].name, 'severity', 'name is correct');
        });
		//single property no old value xml example: '<Properties><Property Label="Severity" Name="severity"><NewValue>3-High</NewValue></Property></Properties>';
        it('noOldValue', function () {
            var prop = pr.createFieldFromProperty(createPropertyObject('Severity', 'severity', '3-High', ''));
            assert.strictEqual(prop.constructor, Array, 'prop must be an array');
            assert.equal(prop.length, 1, 'prop array must have 1 element');
            assert.equal(prop[0].from, undefined, 'no old value presented - new issue in AGM');
            assert.equal(prop[0].to, '3-High', 'new value becomes "to" and keeps the correct value');
            assert.equal(prop[0].label, 'Severity', 'label is correct');
            assert.equal(prop[0].name, 'severity', 'name is correct');
        });
		//2 properties xml example: '<Properties><Property Label="Severity" Name="severity"><NewValue>3-High</NewValue><OldValue>2-Medium</OldValue></Property><Property Label="Assigned to" Name="owner"><NewValue>Rick</NewValue><OldValue>Bob</OldValue></Property></Properties>';
        it('twoProperties', function () {
            var p1 = createPropertyObject('Severity', 'severity', '3-High', '2-Medium');
            var p2 = createPropertyObject('Assigned to', 'owner', 'Rick', 'Bob');
            var p = new Object();
            p = [];
            p.push(p1[0]);
            p.push(p2[0]);
            var prop = pr.createFieldFromProperty(p);
            assert.strictEqual(prop.constructor, Array, 'prop must be an array');
            assert.equal(prop.length, 2, 'prop array must have 1 element');
            assert.equal(prop[0].from, '2-Medium', 'check oldValue for 1st element');
            assert.equal(prop[0].name, 'severity', 'check name for 1st element');
            assert.equal(prop[1].to, 'Rick', 'check newValue for 1st element');
            assert.equal(prop[1].name, 'owner', 'check name for 1st element');
        });
    });

});

function createPropertyObject(label, name, newValue, oldValue) {

    var prop = new Object();
    prop.Property = [];

    var pr1 = new Object();
    pr1.$ = new Object();
    pr1.$.Label = label;
    pr1.$.Name = name;
    pr1.NewValue = [];
    pr1.NewValue.push(newValue);
    if (oldValue) {
        pr1.OldValue = [];
        pr1.OldValue.push(oldValue);
    }

    prop.Property.push(pr1);

    return prop.Property;
}


