#! /usr/bin/env node
import {Command} from 'commander';
import {createCommand} from "./create/command.js";

const program = new Command();
program
  .name('Obsidian PDF album creator')
  .description('Create a printable styled PDF album from Obsidian')

program.addCommand(createCommand());

program.parse(process.argv);

