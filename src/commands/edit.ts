import * as prompts from '@clack/prompts';
import * as config from '../utils/config.js';
import * as logger from '../utils/logger.js';
import { Group } from '../types.js';

export async function editCommand(groupId: string): Promise<void> {
  try {
    const group = await config.getGroup(groupId);

    if (!group) {
      logger.error(`Group "${groupId}" not found`);
      logger.info('Run "skills-manager list" to see available groups');
      process.exit(1);
    }

    logger.heading(`Edit Group: ${group.name}`);

    const action = await prompts.select({
      message: 'What would you like to do?',
      options: [
        { value: 'rename', label: 'Change group name' },
        { value: 'description', label: 'Edit description' },
        { value: 'source', label: 'Edit default source' },
        { value: 'add-skill', label: 'Add skill' },
        { value: 'remove-skill', label: 'Remove skill' },
        { value: 'cancel', label: 'Cancel' },
      ],
    });

    if (prompts.isCancel(action) || action === 'cancel') {
      prompts.cancel('Operation cancelled');
      return;
    }

    switch (action) {
      case 'rename':
        await editName(groupId, group);
        break;
      case 'description':
        await editDescription(groupId, group);
        break;
      case 'source':
        await editSource(groupId, group);
        break;
      case 'add-skill':
        await addSkill(groupId, group);
        break;
      case 'remove-skill':
        await removeSkill(groupId, group);
        break;
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function editName(groupId: string, group: Group): Promise<void> {
  const name = await prompts.text({
    message: 'New group name:',
    placeholder: group.name,
    initialValue: group.name,
    validate: (value) => {
      if (!value) return 'Group name is required';
      return undefined;
    },
  });

  if (prompts.isCancel(name)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  group.name = String(name);
  await config.updateGroup(groupId, group);
  logger.success('Group name updated');
}

async function editDescription(groupId: string, group: Group): Promise<void> {
  const description = await prompts.text({
    message: 'New description:',
    placeholder: group.description || 'Enter a description',
    initialValue: group.description,
  });

  if (prompts.isCancel(description)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  group.description = String(description) || undefined;
  await config.updateGroup(groupId, group);
  logger.success('Description updated');
}

async function editSource(groupId: string, group: Group): Promise<void> {
  const source = await prompts.text({
    message: 'New default source:',
    placeholder: group.source || 'e.g., vercel-labs/agent-skills',
    initialValue: group.source,
  });

  if (prompts.isCancel(source)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  group.source = String(source) || undefined;
  await config.updateGroup(groupId, group);
  logger.success('Default source updated');
}

async function addSkill(groupId: string, group: Group): Promise<void> {
  const skillName = await prompts.text({
    message: 'Skill name:',
    placeholder: 'skill-name',
    validate: (value) => {
      if (!value) return 'Skill name is required';
      return undefined;
    },
  });

  if (prompts.isCancel(skillName)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  const skillSource = await prompts.text({
    message: 'Skill source (leave empty to use default):',
    placeholder: group.source || 'owner/repo',
  });

  if (prompts.isCancel(skillSource)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  const skillSourceStr = String(skillSource).trim();
  const skillNameStr = String(skillName);

  if (skillSourceStr) {
    group.skills.push({ name: skillNameStr, source: skillSourceStr });
  } else if (group.source) {
    group.skills.push(skillNameStr);
  } else {
    logger.error('Skill source is required when no default source is set');
    return;
  }

  await config.updateGroup(groupId, group);
  logger.success(`Skill "${skillNameStr}" added`);
}

async function removeSkill(groupId: string, group: Group): Promise<void> {
  if (group.skills.length === 0) {
    logger.info('No skills to remove');
    return;
  }

  const skills = config.resolveSkills(group);
  
  const skillToRemove = await prompts.select({
    message: 'Select skill to remove:',
    options: skills.map((s) => ({
      value: s.name,
      label: `${s.name} (${s.source})`,
    })),
  });

  if (prompts.isCancel(skillToRemove)) {
    prompts.cancel('Operation cancelled');
    return;
  }

  const skillName = String(skillToRemove);
  
  group.skills = group.skills.filter((s) => {
    const name = typeof s === 'string' ? s : s.name;
    return name !== skillName;
  });

  await config.updateGroup(groupId, group);
  logger.success(`Skill "${skillName}" removed`);
}
