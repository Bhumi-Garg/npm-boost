#!/usr/bin/env node
import { program } from "commander";
import cleanCommand from "../src/commands/clean.js";
import securityCommand from "../src/commands/security.js";
import { runDeps } from "../src/commands/deps.js";

program
  .name("boost")
  .description("Project health toolkit")
  .version("1.0.0");

// deps command
program
  .command("deps")
  .description("Analyse dependencies — unused, heavy, and alternatives")
  .action(runDeps);

// security command
program
  .command("security")
  .description("Check project for security risks")
  .action(securityCommand);

// clean command
program
  .command("clean")
  .description("Remove temporary files and empty folders")
  .action(cleanCommand);

// default action (when no command is passed)
program.action(async () => {
  await runDeps();
  // future:
  // await securityCommand();
  // await cleanCommand();
});

program.parse();