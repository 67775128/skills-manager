import * as config from '../utils/config.js';
import * as logger from '../utils/logger.js';
import pc from 'picocolors';

export async function showCommand(groupId: string): Promise<void> {
  try {
    const group = await config.getGroup(groupId);

    if (!group) {
      logger.error(`Group "${groupId}" not found`);
      logger.info('Run "skills-manager list" to see available groups');
      process.exit(1);
    }

    logger.heading(`${group.name} (${groupId})`);

    if (group.description) {
      console.log(pc.dim(group.description));
      console.log();
    }

    if (group.source) {
      console.log(pc.dim(`Default source: ${group.source}`));
      console.log();
    }

    const skills = config.resolveSkills(group);

    if (skills.length === 0) {
      logger.info('No skills in this group');
      return;
    }

    console.log(pc.bold('Skills:'));
    console.log();

    for (const skill of skills) {
      console.log(pc.cyan('  • ') + pc.bold(skill.name));
      console.log(pc.dim(`    Source: ${skill.source}`));
    }

    console.log();
    logger.info(`Total: ${skills.length} skill${skills.length !== 1 ? 's' : ''}`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
