import * as prompts from '@clack/prompts';
import * as config from '../utils/config.js';
import * as logger from '../utils/logger.js';
import { Group } from '../types.js';

export async function createCommand(): Promise<void> {
  try {
    logger.heading('Create New Group');

    const groupId = await prompts.text({
      message: 'Group ID (lowercase, no spaces):',
      placeholder: 'my-group',
      validate: (value) => {
        if (!value) return 'Group ID is required';
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Group ID must contain only lowercase letters, numbers, and hyphens';
        }
        return undefined;
      },
    });

    if (prompts.isCancel(groupId)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    const groupIdStr = String(groupId);

    // Check if group already exists
    const existingGroup = await config.getGroup(groupIdStr);
    if (existingGroup) {
      logger.error(`Group "${groupIdStr}" already exists`);
      logger.info('Use "skills-manager edit" to modify existing groups');
      process.exit(1);
    }

    const name = await prompts.text({
      message: 'Group name:',
      placeholder: groupIdStr.charAt(0).toUpperCase() + groupIdStr.slice(1),
      validate: (value) => {
        if (!value) return 'Group name is required';
        return undefined;
      },
    });

    if (prompts.isCancel(name)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    const description = await prompts.text({
      message: 'Description (optional):',
      placeholder: 'Enter a description',
    });

    if (prompts.isCancel(description)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    const defaultSource = await prompts.text({
      message: 'Default source (optional):',
      placeholder: 'e.g., vercel-labs/agent-skills',
    });

    if (prompts.isCancel(defaultSource)) {
      prompts.cancel('Operation cancelled');
      return;
    }

    const skills: any[] = [];
    let addMore = true;

    while (addMore) {
      const skillName = await prompts.text({
        message: 'Skill name (or press Enter to finish):',
        placeholder: 'skill-name',
      });

      if (prompts.isCancel(skillName)) {
        prompts.cancel('Operation cancelled');
        return;
      }

      const skillNameStr = String(skillName).trim();

      if (!skillNameStr) {
        addMore = false;
        continue;
      }

      const skillSource = await prompts.text({
        message: 'Skill source (leave empty to use default):',
        placeholder: defaultSource ? String(defaultSource) : 'owner/repo',
      });

      if (prompts.isCancel(skillSource)) {
        prompts.cancel('Operation cancelled');
        return;
      }

      const skillSourceStr = String(skillSource).trim();

      if (skillSourceStr) {
        skills.push({ name: skillNameStr, source: skillSourceStr });
      } else if (defaultSource) {
        skills.push(skillNameStr);
      } else {
        logger.warn('Skill source is required when no default source is set');
        continue;
      }

      const continueAdding = await prompts.confirm({
        message: 'Add another skill?',
        initialValue: true,
      });

      if (prompts.isCancel(continueAdding) || !continueAdding) {
        addMore = false;
      }
    }

    const group: Group = {
      name: String(name),
      description: description ? String(description) : undefined,
      source: defaultSource ? String(defaultSource) : undefined,
      skills,
    };

    await config.addGroup(groupIdStr, group);
    
    logger.success(`Group "${groupIdStr}" created successfully`);
    logger.info(`Configuration saved to ${config.getConfigPath()}`);
    logger.info(`Install with: skills-manager install --group ${groupIdStr}`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
