#! /usr/bin/env node
import {Command} from 'commander';
import {doSomethingCommand} from "./doSomething/command.js";

const program = new Command();
program
  .name('Obsidian PDF Album creator')
  .description('Create printable styled PDF album from Obsidian')

program.addCommand(doSomethingCommand());

program.parse(process.argv);

