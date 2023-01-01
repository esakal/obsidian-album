# Obsidian album creation

Creates a printable PDF album from journal written in Obsidian.

## Command line arguments
to see help type `npx obsidian-album --help`

```bash

> obsidian-album@1.0.0 cli
> node dist/packages/cli/src/cli create --help

Usage: Obsidian PDF Album creator create [options] <target>

Arguments:
  target               target pdf path

Options:
  --verbose            output debug logs (default: false)
  --debug              debug (default: false)
  --vault <path>       the target name (default: "")
  --subFolder <path>   A sub folder inside the vault to look in (default: "")
  --filterBy <path>    A suffix to look for in file name (default: "")
  --filterFrom <path>  Start date to include  (default: "")
  --filterTo <path>    Last date to include (default: "")
  --title <path>       the album name (default: "")
  --coverImage <path>  the album cover image (default: "")
  -h, --help           display help for command
```

## Features:
- [x] Cover page with title and cover image.
- [x] Glue adjacent paragraph and image galleries to avoid page break if possible.
- [x] Create masonry galleries for adjacent images.
- [x] Remove empty paragraphs.
- [x] Keep beginning of a file in a new page.
- [x] Add dot at the end of each parapraph.
- [x] Remove empty section headers.
- [x] Allow splitting of images into different galleries using `...` syntax.
-

## Backlog

- [ ] Reduce images sizes to avoid huge PDF files.
- [ ] LTR support
- [ ] Configuration file and interactive inputs
