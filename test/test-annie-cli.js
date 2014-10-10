var annieCli = require(".."),
    AnnieCliCommand = require("../lib/annie-cli-command"),
    expect = require("expect.js");

describe("annie-cli", function() {
    describe(".createCommand", function() {
        it("should be an alias for AnnieCliCommand.create", function() {
            expect(annieCli.createCommand).to.be(AnnieCliCommand.create);
        });
    });
});

describe("AnnieCliCommand", function() {
    describe(".setJsonData", function() {
        it("should accept well-formed JSON data", function() {
            var cmd = annieCli.createCommand();
            cmd.setJsonData(JSON.stringify({foo:23}));
            expect(cmd.data.foo).to.be(23);
        });

        it("should merge with existing data", function() {
            var cmd = annieCli.createCommand();

            cmd.setJsonData(JSON.stringify({foo:23}));
            cmd.setJsonData(JSON.stringify({bar:42}));
            expect(cmd.data.foo).to.be(23);
            expect(cmd.data.bar).to.be(42);
            
            cmd.setJsonData(JSON.stringify({bar:23}));
            expect(cmd.data.bar).to.be(23);
        });

        it("should take key/val pair with no quotes or braces", function() {
            var cmd = annieCli.createCommand();
            cmd.setJsonData("foo:bar");
            expect(cmd.data.foo).to.be("bar");
        });

        it("should not turn numbers into strings", function() {
            var cmd = annieCli.createCommand();
            cmd.setJsonData("foo:42");
            cmd.setJsonData("bar:1.21");
            expect(cmd.data.foo).to.be(42);
            expect(cmd.data.bar).to.be(1.21);
        });

        it("should not re-quote quoted value", function() {
            var cmd = annieCli.createCommand();
            cmd.setJsonData('foo:"12"');
            cmd.setJsonData('"bar":23');
            expect(cmd.data.foo).to.be("12");
            expect(cmd.data.bar).to.be(23);
        });
    });
});
