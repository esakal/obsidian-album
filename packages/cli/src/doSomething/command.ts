import * as fs from "fs";
import { Command }  from 'commander';
import { printVerboseHook, rootDebug } from '../utils.js';
import * as process from "process";

// TODO general: remember to name the folder of this file as the command name
// TODO general: search all the occurences of `doSomething` and replace with your command name

const debug = rootDebug.extend('doSomething')
const debugError = rootDebug.extend('doSomething:error')

export const doSomethingCommand = () => {
  const command = new Command('doSomething');
  command
    .argument('[path]', "directory to do something with")
    .option('--verbose', 'output debug logs',false)
    .option('--target <name>', 'the target name', 'aws')
    // .requiredOption('--includeDirectories', 'copy directories')
    .hook('preAction', printVerboseHook)
    .action(async(path, options) => {
      if (path && !fs.existsSync(path)) {
        debugError('invalid path provided')
        process.exit(1)
      }

      debug(`Something important is happening now....`)
    });
  return command;
}
