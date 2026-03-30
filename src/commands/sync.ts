import * as prompts from '@clack/prompts';
import * as executor from '../utils/executor.js';
import * as logger from '../utils/logger.js';

export async function syncCommand(): Promise<void> {
  try {
    logger.heading('Sync Skills');

    const action = await prompts.select({
      message: 'What would you like to do?',
      options: [
        { value: 'check', label: 'Check for updates' },
        { value: 'update', label: 'Update all skills' },
        { value: 'cancel', label: 'Cancel' },
      ],
    });

    if (prompts.isCancel(action) || action === 'cancel') {
      prompts.cancel('Operation cancelled');
      return;
    }

    if (action === 'check') {
      logger.step('Checking for skill updates...');
      const result = await executor.checkSkills();
      
      if (result.success) {
        logger.success('Check complete');
      } else {
        logger.error('Check failed');
        if (result.error) {
          console.log(result.error);
        }
      }
    } else if (action === 'update') {
      const confirm = await prompts.confirm({
        message: 'Update all installed skills to latest versions?',
        initialValue: true,
      });

      if (prompts.isCancel(confirm) || !confirm) {
        logger.info('Update cancelled');
        return;
      }

      logger.step('Updating skills...');
      const result = await executor.updateSkills();
      
      if (result.success) {
        logger.success('Update complete');
      } else {
        logger.error('Update failed');
        if (result.error) {
          console.log(result.error);
        }
      }
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
