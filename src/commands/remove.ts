import * as prompts from '@clack/prompts';
import { RemoveOptions } from '../types.js';
import * as config from '../utils/config.js';
import * as executor from '../utils/executor.js';
import * as logger from '../utils/logger.js';

export async function removeCommand(
  skillName: string | undefined,
  options: RemoveOptions
): Promise<void> {
  try {
    const configExists = await config.configExists();
    if (!configExists) {
      logger.error('Configuration file not found. Nothing to remove.');
      process.exit(1);
    }

    // Case 1: Remove by group
    if (options.group && !skillName) {
      await removeGroup(options);
      return;
    }

    // Case 2: Remove single skill (requires group)
    if (skillName) {
      if (!options.group) {
        logger.error('Removing a single skill requires --group parameter');
        logger.info('Example: skills-manager remove web-design-guidelines --group frontend');
        process.exit(1);
      }

      await removeSingleSkill(skillName, options);
      return;
    }

    // Case 3: Interactive remove
    await removeInteractive(options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function removeGroup(options: RemoveOptions): Promise<void> {
  const groupIds = options.group!.split(',').map((g) => g.trim());
  const configuration = await config.loadConfig();

  for (const groupId of groupIds) {
    const group = configuration.groups[groupId];

    if (!group) {
      logger.warn(`Group "${groupId}" not found in configuration`);
      continue;
    }

    logger.heading(`Removing group: ${group.name}`);

    const skills = config.resolveSkills(group);

    // Interactive skill selection (unless --yes is used)
    let selectedSkills = skills;
    if (!options.yes) {
      const selected = await prompts.multiselect({
        message: `Select skills to remove from "${group.name}":`,
        options: skills.map((skill) => ({
          value: skill.name,
          label: skill.name,
          hint: skill.source,
        })),
        initialValues: skills.map(s => s.name), // Default: all selected
        required: false,
      });

      if (prompts.isCancel(selected)) {
        logger.info('Removal cancelled');
        continue;
      }

      selectedSkills = skills.filter(s => 
        (selected as string[]).includes(s.name)
      );

      if (selectedSkills.length === 0) {
        logger.info('No skills selected');
        continue;
      }
    }

    let successCount = 0;
    let failCount = 0;

    for (const skill of selectedSkills) {
      logger.step(`Removing ${skill.name}...`);

      const result = await executor.removeSkill(skill.name, {
        global: options.global,
        agent: options.agent,
        yes: options.yes,
        verbose: true,
        interactive: !options.yes,
      });

      if (result.success) {
        logger.success(`Removed ${skill.name}`);
        successCount++;
      } else {
        logger.warn(`Failed to remove ${skill.name} (may not be installed)`);
        failCount++;
      }
    }

    console.log();
    logger.info(`Group "${groupId}": ${successCount} removed, ${failCount} failed`);
    logger.info('Configuration kept. Use "install --group" to reinstall.');
  }
}

async function removeSingleSkill(skillName: string, options: RemoveOptions): Promise<void> {
  const groupId = options.group!;

  logger.heading(`Removing skill: ${skillName}`);

  const group = await config.getGroup(groupId);

  if (!group) {
    logger.error(`Group "${groupId}" not found in configuration`);
    process.exit(1);
  }

  logger.step(`Removing ${skillName}...`);

  const result = await executor.removeSkill(skillName, {
    global: options.global,
    agent: options.agent,
    yes: options.yes,
    verbose: true,
    interactive: !options.yes,
  });

  if (!result.success) {
    logger.warn(`Failed to remove ${skillName} (may not be installed)`);
  } else {
    logger.success(`Removed ${skillName}`);
  }

  logger.info(`Configuration kept. Use "skills-manager config delete-skill ${skillName} --group ${groupId}" to remove from config.`);
}

async function removeInteractive(options: RemoveOptions): Promise<void> {
  const configuration = await config.loadConfig();
  const groupIds = Object.keys(configuration.groups);

  if (groupIds.length === 0) {
    logger.info('No groups configured');
    return;
  }

  const groupId = await prompts.select({
    message: 'Select a group to remove:',
    options: groupIds.map((id) => ({
      value: id,
      label: `${configuration.groups[id].name} (${id})`,
    })),
  });

  if (prompts.isCancel(groupId)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  await removeGroup({ ...options, group: String(groupId) });
}
