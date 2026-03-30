import * as config from '../utils/config.js';
import * as logger from '../utils/logger.js';
import pc from 'picocolors';

export async function listCommand(): Promise<void> {
  try {
    const configExists = await config.configExists();
    if (!configExists) {
      logger.info('Configuration file not found. Creating default configuration...');
      await config.initializeConfig();
      logger.success(`Configuration created at ${config.getConfigPath()}`);
    }

    const configuration = await config.loadConfig();
    const groupIds = Object.keys(configuration.groups);

    if (groupIds.length === 0) {
      logger.info('No groups configured');
      logger.info(`Edit configuration: ${config.getConfigPath()}`);
      return;
    }

    logger.heading('Configured Groups');

    for (const groupId of groupIds) {
      const group = configuration.groups[groupId];
      const skillCount = group.skills.length;
      
      console.log(pc.bold(pc.cyan(groupId)) + pc.dim(` (${group.name})`));
      
      if (group.description) {
        console.log(pc.dim(`  ${group.description}`));
      }
      
      console.log(pc.dim(`  ${skillCount} skill${skillCount !== 1 ? 's' : ''}`));
      
      if (group.source) {
        console.log(pc.dim(`  Default source: ${group.source}`));
      }
      
      console.log();
    }

    logger.dim(`Configuration: ${config.getConfigPath()}`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
