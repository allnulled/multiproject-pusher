#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const args = process.argv;
const nodePath = args.shift();
const multiprojectPusherPath = args.shift();
const parseArguments = function (args) {
  const parsed = {};
  let currentKey = null;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      // Found a flag
      currentKey = arg.slice(2);
      if (!currentKey) {
        throw new Error(`Invalid parameter at position ${i}`);
      }
      // Assume boolean by default; override if a value follows
      parsed[currentKey] = true;
    } else if (currentKey) {
      // Assign value(s) to the last flag
      if (parsed[currentKey] === true) {
        parsed[currentKey] = arg; // Replace boolean with the first value
      } else if (Array.isArray(parsed[currentKey])) {
        parsed[currentKey].push(arg); // Add to existing array
      } else {
        parsed[currentKey] = [parsed[currentKey], arg]; // Convert to array
      }
    } else {
      throw new Error(`Unexpected value without a flag: ${arg}`);
    }
  }
  return parsed;
}
const parsedArgs = parseArguments(args);
const {
  command: commandInput,
  list: multiprojectListPathInput = "multiproject-list.js",
  precommand: precommandInput = false,
  install,
  push,
  versionate,
} = parsedArgs;
const multiprojectListPath = path.resolve(process.cwd(), multiprojectListPathInput);
let multiprojectList = undefined;
try {
  if (typeof multiprojectListPath !== "string") {
    throw new Error("Required argument «--list» to be a string on «multiproject-pusher.bin»");
  }
  multiprojectList = require(multiprojectListPath);
  if (!fs.existsSync(multiprojectListPath)) {
    throw new Error("Required argument «--list» to point to a existing file on «multiproject-pusher.bin»");
  }
} catch (error) {
  throw new Error("Error loading --list file on «multiproject-pusher.bin»: (" + error.name + ") " + error.message);
}
const MultiprojectPusher = require(__dirname + "/multiproject-pusher.js");

if (!Array.isArray(multiprojectList)) {
  throw new Error(
    `Project list at ${multiprojectListPath} should be an array on «multiproject-pusher.bin»`
  );
}
const listPath = path.dirname(multiprojectListPath);

const multiproject = MultiprojectPusher.from(multiprojectList, listPath);
for (let index = 0; index < multiprojectList.length; index++) {
  const projectItem = multiprojectList[index];
  if (typeof projectItem !== 'object') {
    throw new Error(
      `Project at index ${index} should be an object on «multiproject-pusher.bin»`
    );
  }
}

let precommand = precommandInput;
if(Array.isArray(precommandInput)) {
  precommand = precommandInput.join(" ");
}
if(typeof precommand === "string") {
  // @OK
} else if(precommand === false) {
  // @OK
} else {
  throw new Error("Required argument «--precommand» to be a string or undefined on «multiproject-pusher.bin»");
}

const execute = async function () {

  Installations:
  if (typeof install === "undefined") {
    // @OK
  } else if (typeof install === "boolean") {
    Install_it: {
      await multiproject.install();
    }
  } else {
    throw new Error("Required argument «--install» to be a boolean or empty on «multiproject-pusher.bin»")
  }

  Pushes:
  if (typeof push === "undefined") {
    // @OK
  } else if (typeof push === "boolean") {
    Push_it: {
      await multiproject.push(precommand);
    }
  } else {
    throw new Error("Required argument «--push» to be a boolean or empty on «multiproject-pusher.bin»")
  }

  Versionations:
  if (typeof versionate === "undefined") {
    // @OK
  } else if (typeof versionate === "boolean") {
    Versionate_it: {
      await multiproject.versionate();
    }
  } else {
    throw new Error("Required argument «--versionate» to be a boolean or empty on «multiproject-pusher.bin»")
  }

  let commandArray = undefined;
  if (typeof commandInput == "string") {
    commandArray = [commandInput];
  } else if (Array.isArray(commandInput)) {
    commandArray = commandInput;
  }

  if (typeof commandArray !== "object") {
    throw new Error("Required argument «--command» to be a string or an array on «multiproject-pusher.bin»");
  }

  const commandString = commandArray.join(" ");
  Execute_it: {
    await multiproject.run(commandString);
  }
};

execute();