# multiproject-pusher

To manage multiple (git) projects from 1 source

## Install

```sh
npm i -s @allnulled/multiproject-pusher
```

## CLI

From CLI:

```sh
mpp --install --push --versionate --list multiproject-pusher.list.js --command pwd
```

This will, in this order:

  - run `git clone` and `npm install`
  - run `git add + commit + push`
  - run `npm run versionate`
  - run `pwd`
  
...on every project specified on `multiproject-pusher.list.js`, which is specified like this one:

```js
module.exports = [{
  "name": "@allnulled/browsie",
  "path": "./proj1/subproj1",
  "sourceType": "git",
  "source": "https://github.com/allnulled/browsie.git",
  "version": "last"
}, {
  "name": "@allnulled/browsie",
  "path": "./proj1/subproj2",
  "sourceType": "git",
  "source": "https://github.com/allnulled/superlogger.git",
  "version": "last"
}, {
  "name": "@allnulled/v-descriptor",
  "path": "./proj1/subproj3",
  "sourceType": "git",
  "source": "https://github.com/allnulled/v-descriptor.git",
  "version": "last"
}];
```

The paths of this file are relative to this file itself, not the current working directory.

You can also use `--eval` to provide direct JavaScript from cmd.

You can also use `--fileval` to provide the name of a file in JavaScript from cmd.

## API

The API works like this:

```js
const MultiprojectPusher = require("@allnulled/multiproject-pusher");
const multiproject = MultiprojectPusher.from(require(__dirname + "/multiproject-list.js"), __dirname);

const main = async function() {
  console.log(process.argv);
  await multiproject.install();
  await multiproject.push();
  await multiproject.versionate();
};

module.exports = main();
```

This would install, push and versionate the projects. But if you need something else, you can use:

```js
await multiproject.run("pwd");
```

You can also use `multiproject.inject(functionOrCode)` with a function or a string to eval.