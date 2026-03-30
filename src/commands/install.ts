import * as prompts from '@clack/prompts';
import { InstallOptions } from '../types.js';
import * as config from '../utils/config.js';
import * as executor from '../utils/executor.js';
import * as logger from '../utils/logger.js';

export async function installCommand(
  skillName: string | undefined,
  options: InstallOptions
): Promise<void> {
  try {
    // Ensure config exists
    const configExists = await config.configExists();
    if (!configExists) {
      logger.info('Configuration file not found. Creating default configuration...');
      await config.initializeConfig();
      logger.success(`Configuration created at ${config.getConfigPath()}`);
    }

    // Case 1: Install by group
    if (options.group && !skillName) {
      await installGroup(options);
      return;
    }

    // Case 2: Install single skill (requires both group and source)
    if (skillName) {
      if (!options.group) {
        logger.error('Installing a single skill requires --group parameter');
        logger.info('Example: skills-manager install web-design-guidelines --group frontend --source vercel-labs/agent-skills');
        process.exit(1);
      }

      if (!options.source) {
        logger.error('Installing a single skill requires --source parameter');
        logger.info('Example: skills-manager install web-design-guidelines --group frontend --source vercel-labs/agent-skills');
        process.exit(1);
      }

      await installSingleSkill(skillName, options);
      return;
    }

    // No valid arguments
    logger.error('Missing required arguments');
    logger.info('Usage:');
    logger.info('  Install group: skills-manager install --group <group-name>');
    logger.info('  Install skill: skills-manager install <skill-name> --group <group> --source <source>');
    process.exit(1);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function installGroup(options: InstallOptions): Promise<void> {
  const groupIds = options.group!.split(',').map((g) => g.trim());
  const configuration = await config.loadConfig();

  for (const groupId of groupIds) {
    let group = configuration.groups[groupId];

    if (!group) {
      logger.warn(`Group "${groupId}" not found in configuration`);
      
      const shouldCreate = await prompts.confirm({
        message: `Do you want to create group "${groupId}"?`,
        initialValue: true,
      });

      if (prompts.isCancel(shouldCreate) || !shouldCreate) {
        logger.info(`Skipping group "${groupId}"`);
        continue;
      }

      group = await createGroupInteractive(groupId);
      await config.addGroup(groupId, group);
      logger.success(`Group "${groupId}" created`);
    }

    logger.heading(`Installing group: ${group.name}`);

    const skills = config.resolveSkills(group);
    const sourceOverride = options.source;

    let successCount = 0;
    let failCount = 0;

    for (const skill of skills) {
      const source = sourceOverride || skill.source;
      logger.step(`Installing ${skill.name} from ${source}...`);

      const result = await executor.installSkill(source, skill.name, {
        global: options.global,
        agent: options.agent,
        yes: options.yes || true,
        verbose: false,
      });

      if (result.success) {
        logger.success(`Installed ${skill.name}`);
        successCount++;
      } else {
        logger.error(`Failed to install ${skill.name}: ${result.error || 'Unknown error'}`);
        failCount++;
      }
    }

    console.log();
    logger.info(`Group "${groupId}": ${successCount} succeeded, ${failCount} failed`);
  }
}

async function installSingleSkill(skillName: string, options: InstallOptions): Promise<void> {
  const groupId = options.group!;
  const source = options.source!;

  logger.heading(`Installing skill: ${skillName}`);

  const group = await config.getGroup(groupId);

  if (!group) {
    logger.warn(`Group "${groupId}" not found in configuration`);
    
    const shouldCreate = await prompts.confirm({
      message: `Do you want to create group "${groupId}"?`,
      initialValue: true,
    });

    if (prompts.isCancel(shouldCreate) || !shouldCreate) {
      logger.error('Installation cancelled');
      process.exit(1);
    }

    const newGroup = await createGroupInteractive(groupId);
    await config.addGroup(groupId, newGroup);
    logger.success(`Group "${groupId}" created`);
  }

  logger.step(`Installing ${skillName} from ${source}...`);

  const result = await executor.installSkill(source, skillName, {
    global: options.global,
    agent: options.agent,
    yes: options.yes || true,
    verbose: false,
  });

  if (!result.success) {
    logger.error(`Failed to install ${skillName}: ${result.error || 'Unknown error'}`);
    process.exit(1);
  }

  logger.success(`Installed ${skillName}`);

  // Ask if user wants to add to config
  const existingGroup = await config.getGroup(groupId);
  if (existingGroup) {
    const skills = config.resolveSkills(existingGroup);
    const skillExists = skills.some((s) => s.name === skillName);

    if (!skillExists) {
      const shouldAdd = await prompts.confirm({
        message: `Add "${skillName}" to group "${groupId}" in configuration?`,
        initialValue: true,
      });

      if (!prompts.isCancel(shouldAdd) && shouldAdd) {
        await config.addSkillToGroup(groupId, skillName, source);
        logger.success(`Added to configuration`);
      }
    }
  }
}

async function createGroupInteractive(groupId: string): Promise<any> {
  const name = await prompts.text({
    message: 'Group name:',
    placeholder: groupId.charAt(0).toUpperCase() + groupId.slice(1),
    validate: (value) => {
      if (!value) return 'Group name is required';
      return undefined;
    },
  });

  if (prompts.isCancel(name)) {
    prompts.cancel('Operation cancelled');
    process.exit(0);
  }

  const description = await prompts.text({
    message: 'Description (optional):',
    placeholder: 'Enter a description',
  });

  if (prompts.isCancel(description)) {
    prompts.cancel('Operation cancelled');
    process.exit(0);
  }

  const defaultSource = await prompts.text({
    message: 'Default source (optional):',
    placeholder: 'e.g., vercel-labs/agent-skills',
  });

  if (prompts.isCancel(defaultSource)) {
    prompts.cancel('Operation cancelled');
    process.exit(0);
  }

  const skillsInput = await prompts.text({
    message: 'Skills (comma-separated):',
    placeholder: 'skill-1, skill-2',
  });

  if (prompts.isCancel(skillsInput)) {
    prompts.cancel('Operation cancelled');
    process.exit(0);
  }

  const skillNames = String(skillsInput)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    name: String(name),
    description: description ? String(description) : undefined,
    source: defaultSource ? String(defaultSource) : undefined,
    skills: skillNames,
  };
}
