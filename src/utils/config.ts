import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Config, ConfigSchema, Group, ResolvedSkill } from '../types.js';

const CONFIG_DIR = path.join(os.homedir(), '.skills-manager');
const CONFIG_FILE = path.join(CONFIG_DIR, 'groups.json');
const BACKUP_FILE = path.join(CONFIG_DIR, 'groups.json.backup');

// Default example configuration
const DEFAULT_CONFIG: Config = {
  groups: {
    frontend: {
      name: 'Frontend Development',
      description: '前端开发相关技能',
      source: 'vercel-labs/agent-skills',
      skills: [
        'web-design-guidelines',
        'vercel-react-best-practices',
      ],
    },
    backend: {
      name: 'Backend Development',
      description: '后端开发相关技能',
      source: 'vercel-labs/agent-skills',
      skills: ['nodejs-backend-patterns', 'api-design-principles'],
    },
  },
};

export async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create config directory: ${error}`);
  }
}

export async function configExists(): Promise<boolean> {
  try {
    await fs.access(CONFIG_FILE);
    return true;
  } catch {
    return false;
  }
}

export async function initializeConfig(): Promise<void> {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
}

export async function loadConfig(): Promise<Config> {
  const exists = await configExists();
  
  if (!exists) {
    await initializeConfig();
  }

  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    const data = JSON.parse(content);
    return ConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
    throw error;
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await ensureConfigDir();
  
  // Backup existing config
  const exists = await configExists();
  if (exists) {
    try {
      const existingContent = await fs.readFile(CONFIG_FILE, 'utf-8');
      await fs.writeFile(BACKUP_FILE, existingContent, 'utf-8');
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }

  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export async function validateConfig(config: unknown): Promise<{ valid: boolean; errors?: string[] }> {
  try {
    ConfigSchema.parse(config);
    return { valid: true };
  } catch (error: any) {
    const errors = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [error.message];
    return { valid: false, errors };
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function resolveSkills(group: Group): ResolvedSkill[] {
  return group.skills.map((skill) => {
    if (typeof skill === 'string') {
      if (!group.source) {
        throw new Error(`Skill "${skill}" has no source, and group has no default source`);
      }
      return { name: skill, source: group.source };
    }
    return skill;
  });
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const config = await loadConfig();
  return config.groups[groupId] || null;
}

export async function addGroup(groupId: string, group: Group): Promise<void> {
  const config = await loadConfig();
  config.groups[groupId] = group;
  await saveConfig(config);
}

export async function updateGroup(groupId: string, group: Group): Promise<void> {
  const config = await loadConfig();
  if (!config.groups[groupId]) {
    throw new Error(`Group "${groupId}" does not exist`);
  }
  config.groups[groupId] = group;
  await saveConfig(config);
}

export async function deleteGroup(groupId: string): Promise<void> {
  const config = await loadConfig();
  if (!config.groups[groupId]) {
    throw new Error(`Group "${groupId}" does not exist`);
  }
  delete config.groups[groupId];
  await saveConfig(config);
}

export async function addSkillToGroup(groupId: string, skillName: string, source: string): Promise<void> {
  const config = await loadConfig();
  const group = config.groups[groupId];
  
  if (!group) {
    throw new Error(`Group "${groupId}" does not exist`);
  }

  // Check if skill already exists
  const existingSkill = group.skills.find((s) => {
    const name = typeof s === 'string' ? s : s.name;
    return name === skillName;
  });

  if (existingSkill) {
    throw new Error(`Skill "${skillName}" already exists in group "${groupId}"`);
  }

  // Add skill
  group.skills.push({ name: skillName, source });
  await saveConfig(config);
}

export async function removeSkillFromGroup(groupId: string, skillName: string): Promise<void> {
  const config = await loadConfig();
  const group = config.groups[groupId];
  
  if (!group) {
    throw new Error(`Group "${groupId}" does not exist`);
  }

  const initialLength = group.skills.length;
  group.skills = group.skills.filter((s) => {
    const name = typeof s === 'string' ? s : s.name;
    return name !== skillName;
  });

  if (group.skills.length === initialLength) {
    throw new Error(`Skill "${skillName}" not found in group "${groupId}"`);
  }

  await saveConfig(config);
}

export async function resetConfig(): Promise<void> {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
}
