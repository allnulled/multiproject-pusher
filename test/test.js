const MultiprojectPusher = require(__dirname + "/../multiproject-pusher.js");
const multiproject = MultiprojectPusher.from(require(__dirname + "/multiproject-list.js"), __dirname);

const main = async function() {
  console.log(process.argv);
  // await multiproject.install();
  await multiproject.push();
  // await multiproject.versionate();
};

module.exports = main();
