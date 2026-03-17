#!/usr/bin/env node
import { program } from "commander";
import cleanCommand from "../src/commands/clean.js";
import securityCommand from "../src/commands/security.js";

program
  .command("security")
  .description("Check project for security risks")
  .action(securityCommand);

program
  .name("boost")
  .description("Project health toolkit")
  .version("1.0.0");

program
  .command("clean")
  .description("Remove temporary files and empty folders")
  .action(cleanCommand);

program.parse();