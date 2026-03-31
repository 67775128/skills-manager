# Skills Manager Examples

## Getting Started

### First Time Setup

When you run any command for the first time, the tool automatically creates a configuration file:

```bash
$ skills-manager list

ℹ Configuration file not found. Creating default configuration...
✓ Configuration created at /Users/username/.skills-manager/groups.json

Configured Groups

frontend (Frontend Development)
  前端开发相关技能
  3 skills
  Default source: vercel-labs/agent-skills

backend (Backend Development)
  后端开发相关技能
  2 skills
  Default source: vercel-labs/agent-skills

Configuration: /Users/username/.skills-manager/groups.json
```

## Basic Usage

> **Note**: All commands preserve the interactive features of `vercel-labs/skills`. You'll see prompts for agent selection, confirmation, and other options unless you use the `-y/--yes` flag.

### Install a Group

```bash
$ skills-manager install --group frontend

Installing group: Frontend Development

→ Installing web-design-guidelines from vercel-labs/agent-skills...
✓ Installed web-design-guidelines
→ Installing tailwind-design-system from vercel-labs/agent-skills...
✓ Installed tailwind-design-system
→ Installing vercel-react-best-practices from vercel-labs/agent-skills...
✓ Installed vercel-react-best-practices

ℹ Group "frontend": 3 succeeded, 0 failed
```

### Show Group Details

```bash
$ skills-manager show frontend

Frontend Development (frontend)

前端开发相关技能

Default source: vercel-labs/agent-skills

Skills:

  • web-design-guidelines
    Source: vercel-labs/agent-skills
  • tailwind-design-system
    Source: vercel-labs/agent-skills
  • vercel-react-best-practices
    Source: vercel-labs/agent-skills

ℹ Total: 3 skills
```

### Remove a Group

```bash
$ skills-manager remove --group frontend

Removing group: Frontend Development

→ Removing web-design-guidelines...
✓ Removed web-design-guidelines
→ Removing tailwind-design-system...
✓ Removed tailwind-design-system
→ Removing vercel-react-best-practices...
✓ Removed vercel-react-best-practices

ℹ Group "frontend": 3 removed, 0 failed
ℹ Configuration kept. Use "install --group" to reinstall.
```

## Creating Custom Groups

### Interactive Creation

```bash
$ skills-manager create

Create New Group

? Group ID (lowercase, no spaces): my-tools
? Group name: My Development Tools
? Description (optional): Tools I use daily
? Default source (optional): vercel-labs/agent-skills
? Skill name (or press Enter to finish): git-commit
? Skill source (leave empty to use default): 
? Add another skill? (Y/n) y
? Skill name (or press Enter to finish): playwright-best-practices
? Skill source (leave empty to use default): 
? Add another skill? (Y/n) n

✓ Group "my-tools" created successfully
ℹ Configuration saved to /Users/username/.skills-manager/groups.json
ℹ Install with: skills-manager install --group my-tools
```

## Advanced Usage

### Install Single Skill

```bash
$ skills-manager install custom-skill --group my-tools --source owner/repo

Installing skill: custom-skill

→ Installing custom-skill from owner/repo...
✓ Installed custom-skill
? Add "custom-skill" to group "my-tools" in configuration? (Y/n) y
✓ Added to configuration
```

### Install with Overridden Source

Test a fork of a skill repository:

```bash
$ skills-manager install --group frontend --source my-fork/agent-skills

Installing group: Frontend Development

→ Installing web-design-guidelines from my-fork/agent-skills...
✓ Installed web-design-guidelines
...
```

### Edit Group

```bash
$ skills-manager edit frontend

Edit Group: Frontend Development

? What would you like to do?
❯ Change group name
  Edit description
  Edit default source
  Add skill
  Remove skill
  Cancel
```

## Configuration Management

### View Configuration

```bash
$ skills-manager config

Configuration

Location: /Users/username/.skills-manager/groups.json
Status: Exists
Groups: 3

ℹ Commands:
  skills-manager config --edit      Open in editor
  skills-manager config --validate  Validate format
  skills-manager config --reset     Reset to defaults
  skills-manager config delete <group>  Delete group from config
```

### Validate Configuration

```bash
$ skills-manager config --validate

→ Validating configuration...
✓ Configuration is valid
ℹ Found 3 groups
✓ Group "frontend": OK
✓ Group "backend": OK
✓ Group "my-tools": OK
```

### Delete Group from Config

```bash
$ skills-manager config delete my-tools

? Delete group "My Development Tools" (my-tools) from configuration? (y/N) y
✓ Deleted group "my-tools" from configuration
ℹ Note: Installed skills are not removed. Use "remove --group" to uninstall.
```

### Delete Skill from Group Config

**Interactive mode (no arguments):**
```bash
$ skills-manager config delete-skill

? Select a group: › 
  Frontend Development (frontend)
  Backend Development (backend)

? Select a skill to delete: › 
  web-design-guidelines
  tailwind-design-system
  vercel-react-best-practices

? Delete skill "web-design-guidelines" from group "Frontend Development" (frontend)? (y/N) y
✓ Deleted skill "web-design-guidelines" from group "frontend"
ℹ Note: Installed skill is not removed. Use "remove" command to uninstall.
```

**Direct mode (with arguments):**
```bash
$ skills-manager config delete-skill web-design-guidelines --group frontend

? Delete skill "web-design-guidelines" from group "Frontend Development" (frontend)? (y/N) y
✓ Deleted skill "web-design-guidelines" from group "frontend"
ℹ Note: Installed skill is not removed. Use "remove" command to uninstall.
```

## Interactive vs Non-Interactive Mode

### Interactive Mode (Default)

When you don't use `--yes`, the underlying `skills` command will prompt you interactively:

```bash
$ skills-manager install --group frontend

# You'll see skills CLI prompts like:
? Select agents to install to: (Press <space> to select, <a> to toggle all)
❯ ◯ cursor
  ◯ claude-code
  ◯ cline
  
? Confirm installation? (Y/n)
```

### Non-Interactive Mode (CI/CD)

Use `--yes` to skip all prompts:

```bash
# Skip all prompts - for CI/CD environments
skills-manager install --group frontend --yes

# Also useful for scripting
skills-manager remove --group frontend --yes
```

## Working with Multiple Agents

### Install to Specific Agent

```bash
# Install to Cursor
skills-manager install --group frontend --agent cursor

# Install globally
skills-manager install --group frontend --global

# Combine options
skills-manager install --group frontend --global --agent cursor --yes
```

### Remove from Specific Agent

```bash
skills-manager remove --group frontend --agent cursor --global
```

## Sync and Update

### Check for Updates

```bash
$ skills-manager sync

Sync Skills

? What would you like to do?
❯ Check for updates
  Update all skills
  Cancel
```

## Batch Operations

### Install Multiple Groups

```bash
$ skills-manager install --group frontend,backend,ai-tools

Installing group: Frontend Development
...
Installing group: Backend Development
...
Installing group: AI Development Tools
...
```

### Remove Multiple Groups

```bash
$ skills-manager remove --group frontend,backend
```

### Delete Multiple Groups from Config

```bash
$ skills-manager config delete frontend,backend
```

## Complete Workflow Example

```bash
# 1. List available groups
skills-manager list

# 2. Create a custom group
skills-manager create

# 3. Install the group
skills-manager install --group my-custom-group

# 4. Show what was installed
skills-manager show my-custom-group

# 5. Later, temporarily remove
skills-manager remove --group my-custom-group

# 6. Even later, reinstall
skills-manager install --group my-custom-group

# 7. Permanently remove
skills-manager remove --group my-custom-group
skills-manager config delete my-custom-group
```

## Configuration File Examples

### Simple Configuration (All from One Source)

```json
{
  "groups": {
    "essentials": {
      "name": "Essential Skills",
      "description": "Must-have skills for development",
      "source": "vercel-labs/agent-skills",
      "skills": [
        "git-commit",
        "create-readme",
        "skill-creator"
      ]
    }
  }
}
```

### Mixed Sources Configuration

```json
{
  "groups": {
    "mixed": {
      "name": "Mixed Sources",
      "description": "Skills from different repositories",
      "skills": [
        {
          "name": "skill-from-vercel",
          "source": "vercel-labs/agent-skills"
        },
        {
          "name": "skill-from-my-org",
          "source": "my-org/custom-skills"
        },
        {
          "name": "local-skill",
          "source": "./local-skills"
        }
      ]
    }
  }
}
```

### Multiple Groups Configuration

```json
{
  "groups": {
    "web": {
      "name": "Web Development",
      "source": "vercel-labs/agent-skills",
      "skills": ["web-design-guidelines", "tailwind-design-system"]
    },
    "mobile": {
      "name": "Mobile Development",
      "source": "vercel-labs/agent-skills",
      "skills": ["vercel-react-native-skills"]
    },
    "ai": {
      "name": "AI Tools",
      "source": "openai/agent-skills",
      "skills": ["openai-best-practices"]
    },
    "custom": {
      "name": "Custom Tools",
      "skills": [
        {
          "name": "tool-1",
          "source": "my-org/tools"
        },
        {
          "name": "tool-2",
          "source": "https://github.com/another-org/skills"
        }
      ]
    }
  }
}
```
