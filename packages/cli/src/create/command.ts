import * as fs from "fs";
import { Command }  from 'commander';
import { printVerboseHook, rootDebug } from '../utils.js';
import * as process from "process";
import { create } from './create.js'

const debug = rootDebug.extend('create')
const debugError = rootDebug.extend('create:error')

export const createCommand = () => {
  const command = new Command('create');
  command
    .argument('<target>', 'target pdf path')
    .option('--verbose', 'output debug logs',false)
    .option('--debug', 'debug',false)
    .option('--backCover', 'should create back cover',false)
    .option('--extraEmptyPage', 'should add empty page at the end of the album',false)
    .requiredOption('--vault <path>', 'the target name', '')
    .option('--subFolder <path>', 'A sub folder inside the vault to look in', '')
    .option('--filterBy <path>', 'A suffix to look for in file name', '')
    .requiredOption('--filterFrom <path>', 'Start date to include ', '')
    .requiredOption('--filterTo <path>', 'Last date to include', '')
    .requiredOption('--title <path>', 'the album name', '')
    .option('--coverImage <path>', 'the album cover image', '')
    .hook('preAction', printVerboseHook)
    .action(async(target, options) => {
      if (options.vault && !fs.existsSync(options.vault)) {
        debugError('invalid path provided for the vault')
        process.exit(1)
      }


      create({
        target,
        vault: options.vault,
        debugMode: options.debug,
        backCover: options.backCover,
        extraEmptyPage: options.extraEmptyPage,
        subFolder: options.subFolder,
        filterBy: options.filterBy,
        filterFrom: options.filterFrom,
        filterTo: options.filterTo,
        title: options.title,
        coverImage: options.coverImage,
      });
    });
  return command;
}
