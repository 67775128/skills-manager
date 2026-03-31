import { spawn } from 'child_process';
import * as prompts from '@clack/prompts';
import * as config from '../utils/config.js';
import * as logger from '../utils/logger.js';
import { ConfigCommandOptions } from '../types.js';
import pc from 'picocolors';

export async function configCommand(
  groupToDelete?: string,
  options: ConfigCommandOptions = {}
): Promise<void> {
  try {
    const configPath = config.getConfigPath();

    // Handle subcommands
    if (options.edit) {
      await openInEditor(configPath);
      return;
    }

    if (options.validate) {
      await validateConfigFile();
      return;
    }

    if (options.reset) {
      await resetConfigFile();
      return;
    }

    // Delete group
    if (groupToDelete) {
      await deleteGroups(groupToDelete);
      return;
    }

    // Default: show config path
    await showConfigInfo();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

export async function deleteSkillCommand(
  skillName: string | undefined,
  options: { group?: string } = {}
): Promise<void> {
  try {
    // Interactive mode: no skill name or group provided
    if (!skillName || !options.group) {
      await deleteSkillInteractive();
      return;
    }

    // Direct mode: both skill name and group provided
    await deleteSkillFromGroup(skillName, options.group);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function showConfigInfo(): Promise<void> {
  const configPath = config.getConfigPath();
  const exists = await config.configExists();

  logger.heading('Configuration');

  console.log(pc.dim('Location:'), pc.cyan(configPath));
  console.log(pc.dim('Status:'), exists ? pc.green('Exists') : pc.yellow('Not found'));

  if (exists) {
    const configuration = await config.loadConfig();
    const groupCount = Object.keys(configuration.groups).length;
    console.log(pc.dim('Groups:'), groupCount);
  }

  console.log();
  logger.info('Commands:');
  logger.dim('  skills-manager config --edit                    Open in editor');
  logger.dim('  skills-manager config --validate                Validate format');
  logger.dim('  skills-manager config --reset                   Reset to defaults');
  logger.dim('  skills-manager config delete <group>            Delete group from config');
  logger.dim('  skills-manager config delete-skill              Interactive: delete skill from group');
  logger.dim('  skills-manager config delete-skill <skill> -g   Direct: delete skill from group');
}

async function openInEditor(configPath: string): Promise<void> {
  const editor = process.env.EDITOR || process.env.VISUAL || 'vi';

  logger.info(`Opening ${configPath} in ${editor}...`);

  const child = spawn(editor, [configPath], {
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    if (code === 0) {
      logger.success('Editor closed');
    } else {
      logger.warn(`Editor exited with code ${code}`);
    }
  });
}

async function validateConfigFile(): Promise<void> {
  logger.step('Validating configuration...');

  try {
    const configuration = await config.loadConfig();
    const result = await config.validateConfig(configuration);

    if (result.valid) {
      logger.success('Configuration is valid');
      
      const groupCount = Object.keys(configuration.groups).length;
      logger.info(`Found ${groupCount} group${groupCount !== 1 ? 's' : ''}`);
      
      // Validate that all skills have sources
      for (const [groupId, group] of Object.entries(configuration.groups)) {
        try {
          config.resolveSkills(group);
          logger.success(`Group "${groupId}": OK`);
        } catch (error) {
          logger.error(`Group "${groupId}": ${error instanceof Error ? error.message : 'Error'}`);
        }
      }
    } else {
      logger.error('Configuration is invalid');
      if (result.errors) {
        for (const error of result.errors) {
          logger.error(`  ${error}`);
        }
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function resetConfigFile(): Promise<void> {
  const confirm = await prompts.confirm({
    message: 'Reset configuration to defaults? This will overwrite your current configuration.',
    initialValue: false,
  });

  if (prompts.isCancel(confirm) || !confirm) {
    logger.info('Reset cancelled');
    return;
  }

  await config.resetConfig();
  logger.success('Configuration reset to defaults');
  logger.info(`Location: ${config.getConfigPath()}`);
}

async function deleteGroups(groupIds: string): Promise<void> {
  const groupList = groupIds.split(',').map((g) => g.trim());
  const configuration = await config.loadConfig();

  for (const groupId of groupList) {
    if (!configuration.groups[groupId]) {
      logger.warn(`Group "${groupId}" not found in configuration`);
      continue;
    }

    const group = configuration.groups[groupId];
    const confirm = await prompts.confirm({
      message: `Delete group "${group.name}" (${groupId}) from configuration?`,
      initialValue: false,
    });

    if (prompts.isCancel(confirm) || !confirm) {
      logger.info(`Skipped "${groupId}"`);
      continue;
    }

    await config.deleteGroup(groupId);
    logger.success(`Deleted group "${groupId}" from configuration`);
    logger.info('Note: Installed skills are not removed. Use "remove --group" to uninstall.');
  }
}

async function deleteSkillInteractive(): Promise<void> {
  const configuration = await config.loadConfig();
  const groupIds = Object.keys(configuration.groups);

  if (groupIds.length === 0) {
    logger.info('No groups configured');
    return;
  }

  // Step 1: Select group
  const groupId = await prompts.select({
    message: 'Select a group:',
    options: groupIds.map((id) => ({
      value: id,
      label: `${configuration.groups[id].name} (${id})`,
    })),
  });

  if (prompts.isCancel(groupId)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  const group = configuration.groups[String(groupId)];
  const skills = config.resolveSkills(group);

  if (skills.length === 0) {
    logger.info(`No skills in group "${groupId}"`);
    return;
  }

  // Step 2: Select skill
  const skillName = await prompts.select({
    message: 'Select a skill to delete:',
    options: skills.map((skill) => ({
      value: skill.name,
      label: skill.name,
    })),
  });

  if (prompts.isCancel(skillName)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  // Step 3: Confirm deletion
  const confirm = await prompts.confirm({
    message: `Delete skill "${String(skillName)}" from group "${group.name}" (${groupId})?`,
    initialValue: false,
  });

  if (prompts.isCancel(confirm) || !confirm) {
    logger.info('Operation cancelled');
    return;
  }

  try {
    await config.removeSkillFromGroup(String(groupId), String(skillName));
    logger.success(`Deleted skill "${String(skillName)}" from group "${groupId}"`);
    logger.info('Note: Installed skill is not removed. Use "remove" command to uninstall.');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function deleteSkillFromGroup(skillName: string, groupId: string): Promise<void> {
  const configuration = await config.loadConfig();

  if (!configuration.groups[groupId]) {
    logger.error(`Group "${groupId}" not found in configuration`);
    process.exit(1);
  }

  const group = configuration.groups[groupId];
  const confirm = await prompts.confirm({
    message: `Delete skill "${skillName}" from group "${group.name}" (${groupId})?`,
    initialValue: false,
  });

  if (prompts.isCancel(confirm) || !confirm) {
    logger.info('Operation cancelled');
    return;
  }

  try {
    await config.removeSkillFromGroup(groupId, skillName);
    logger.success(`Deleted skill "${skillName}" from group "${groupId}"`);
    logger.info('Note: Installed skill is not removed. Use "remove" command to uninstall.');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
