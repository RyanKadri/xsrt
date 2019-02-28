require("./init");

const Jasmine = require("jasmine");
const jasmine = new Jasmine();
jasmine.loadConfigFile(__dirname + "../../../jasmine.json");
const files = process.argv.slice(2);
if(files.length > 3) {
    console.log(files)
    jasmine.execute(files);
} else {
    jasmine.execute();
}
