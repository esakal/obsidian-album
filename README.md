# Obsidian album creation

## Documentation
See the package [README.md file](./packages/cli/README.md)

## Build the library
run `npm run build` to build the library and `npm run watch` to also watch for changes.

## Running the library
run `npm run cli -- ` and add arguments. For example `npm run cli -- --help`.

## Example for an album to be printed by picabook
```bash
node ../dist/packages/cli/src/cli create family2022-06-07.pdf --vault '/Volumes/LocalData/synology/main/archive-synced/obsidian/vaults/eran-sakal' \
      --subFolder 'life-journey' --filterBy '(life journey)' --filterFrom '2022-06-01' --filterTo '2022-07-31' \
      --title 'אלבום משפחתי' --coverImage 'Pasted image 20230430001644.png' --backCover --extraEmptyPage
```

Note that `--extraEmptyPage` is needed if the numbe of pages are odd. This is not supported in picabook. 
