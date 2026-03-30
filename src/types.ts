import { z } from 'zod';

// Skill can be a string (simple format) or an object with name and source
export const SkillSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    source: z.string(),
  }),
]);

export type Skill = z.infer<typeof SkillSchema>;

// Group definition
export const GroupSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  source: z.string().optional(),
  skills: z.array(SkillSchema),
});

export type Group = z.infer<typeof GroupSchema>;

// Configuration file structure
export const ConfigSchema = z.object({
  groups: z.record(z.string(), GroupSchema),
});

export type Config = z.infer<typeof ConfigSchema>;

// Resolved skill with explicit source
export interface ResolvedSkill {
  name: string;
  source: string;
}

// Command options
export interface InstallOptions {
  group?: string;
  source?: string;
  global?: boolean;
  agent?: string;
  yes?: boolean;
}

export interface RemoveOptions {
  group?: string;
  global?: boolean;
  agent?: string;
  yes?: boolean;
}

export interface ConfigCommandOptions {
  edit?: boolean;
  validate?: boolean;
  reset?: boolean;
}

// Executor result
export interface ExecutorResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}
