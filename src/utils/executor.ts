import { spawn } from 'child_process';
import { ExecutorResult } from '../types.js';
import * as logger from './logger.js';

export async function executeSkillsCommand(
  command: string,
  args: string[],
  options: { verbose?: boolean } = {}
): Promise<ExecutorResult> {
  return new Promise((resolve) => {
    const { verbose = false } = options;
    
    if (verbose) {
      logger.step(`Executing: npx skills ${command} ${args.join(' ')}`);
    }

    const childProcess = spawn('npx', ['skills', command, ...args], {
      stdio: verbose ? 'inherit' : 'pipe',
      shell: true,
    });

    let output = '';
    let errorOutput = '';

    if (!verbose) {
      childProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });

      childProcess.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });
    }

    childProcess.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output.trim(),
        error: errorOutput.trim() || undefined,
        exitCode: code || 0,
      });
    });

    childProcess.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: err.message,
        exitCode: 1,
      });
    });
  });
}

export async function installSkill(
  source: string,
  skillName: string,
  options: {
    global?: boolean;
    agent?: string;
    yes?: boolean;
    verbose?: boolean;
  } = {}
): Promise<ExecutorResult> {
  const args: string[] = [source, '--skill', skillName];

  if (options.global) {
    args.push('--global');
  }

  if (options.agent) {
    args.push('--agent', options.agent);
  }

  if (options.yes) {
    args.push('--yes');
  }

  return executeSkillsCommand('add', args, { verbose: options.verbose });
}

export async function removeSkill(
  skillName: string,
  options: {
    global?: boolean;
    agent?: string;
    yes?: boolean;
    verbose?: boolean;
  } = {}
): Promise<ExecutorResult> {
  const args: string[] = [skillName];

  if (options.global) {
    args.push('--global');
  }

  if (options.agent) {
    args.push('--agent', options.agent);
  }

  if (options.yes) {
    args.push('--yes');
  }

  return executeSkillsCommand('remove', args, { verbose: options.verbose });
}

export async function listInstalledSkills(options: {
  global?: boolean;
  agent?: string;
} = {}): Promise<ExecutorResult> {
  const args: string[] = [];

  if (options.global) {
    args.push('--global');
  }

  if (options.agent) {
    args.push('--agent', options.agent);
  }

  return executeSkillsCommand('list', args);
}

export async function updateSkills(): Promise<ExecutorResult> {
  return executeSkillsCommand('update', [], { verbose: true });
}

export async function checkSkills(): Promise<ExecutorResult> {
  return executeSkillsCommand('check', [], { verbose: true });
}
