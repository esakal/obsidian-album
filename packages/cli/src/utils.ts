import Debug from 'debug';

// TODO replace `obsidian-album` with a friendly short label that describe best your library
export const rootDebug = Debug('obsidian-album')

export const printVerboseHook = (thisCommand) => {

  const options = thisCommand.opts();

  if (options.verbose) {
    Debug.enable('obsidian-album*');
    rootDebug(`CLI arguments`);
    rootDebug(options);
  }
}
