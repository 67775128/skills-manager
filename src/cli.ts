#!/usr/bin/env node

import { Command } from 'commander';
import { installCommand } from './commands/install.js';
import { removeCommand } from './commands/remove.js';
import { listCommand } from './commands/list.js';
import { showCommand } from './commands/show.js';
import { createCommand } from './commands/create.js';
import { editCommand } from './commands/edit.js';
import { configCommand, deleteSkillCommand } from './commands/config-cmd.js';
import { syncCommand } from './commands/sync.js';

const program = new Command();

program
  .name('skills-manager')
  .description('CLI tool for managing agent skills in groups')
  .version('0.1.0');

// Install command
program
  .command('install [skill-name]')
  .description('Install skills by group or individually')
  .option('-g, --group <group>', 'Group ID(s) to install (comma-separated)')
  .option('-s, --source <source>', 'Override source for installation')
  .option('--global', 'Install globally instead of project-level')
  .option('-a, --agent <agent>', 'Target specific agent')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(installCommand);

// Remove command
program
  .command('remove [skill-name]')
  .description('Remove installed skills')
  .option('-g, --group <group>', 'Group ID(s) to remove (comma-separated)')
  .option('--global', 'Remove from global installation')
  .option('-a, --agent <agent>', 'Target specific agent')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(removeCommand);

// List command
program
  .command('list')
  .alias('ls')
  .description('List all configured groups')
  .action(listCommand);

// Show command
program
  .command('show <group-id>')
  .description('Show skills in a specific group')
  .action(showCommand);

// Create command
program
  .command('create')
  .description('Create a new group interactively')
  .action(createCommand);

// Edit command
program
  .command('edit <group-id>')
  .description('Edit an existing group')
  .action(editCommand);

// Config command
const configCmd = program
  .command('config')
  .description('Manage configuration file')
  .option('--edit', 'Open configuration in editor')
  .option('--validate', 'Validate configuration format')
  .option('--reset', 'Reset to default configuration')
  .action((options) => {
    configCommand(undefined, options);
  });

// Config delete subcommand
configCmd
  .command('delete <group-ids>')
  .description('Delete group(s) from configuration')
  .action((groupIds) => {
    configCommand(groupIds);
  });

// Config delete-skill subcommand
configCmd
  .command('delete-skill [skill-name]')
  .description('Delete skill from group configuration (interactive if no args)')
  .option('-g, --group <group>', 'Group ID to delete skill from')
  .action((skillName, options) => {
    deleteSkillCommand(skillName, options);
  });

// Sync command
program
  .command('sync')
  .description('Check and update installed skills')
  .action(syncCommand);

program.parse();
