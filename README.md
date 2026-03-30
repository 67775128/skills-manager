# Skills Manager

CLI tool for managing agent skills in groups with batch install/remove operations.

## Overview

Skills Manager is a wrapper around [vercel-labs/skills](https://github.com/vercel-labs/skills) that provides group-based batch management of agent skills. Define your skills in organized groups and install/remove them in batch operations.

## Features

- 📦 **Group-based management**: Organize skills into logical groups
- 🚀 **Batch operations**: Install or remove entire groups at once
- ⚙️ **Flexible configuration**: Support for multiple sources per group
- 🔄 **Smart defaults**: Auto-initialize with example configuration
- 🎯 **Interactive CLI**: User-friendly prompts and confirmations
- 💾 **Global configuration**: Single config file shared across projects

## Installation

```bash
npm install -g skills-manager
```

## Quick Start

```bash
# List configured groups (auto-creates config on first run)
skills-manager list

# Install a group
skills-manager install --group frontend

# Create a new group
skills-manager create

# Show group details
skills-manager show frontend
```

## Configuration

Configuration is stored at `~/.skills-manager/groups.json`.

### Example Configuration

```json
{
  "groups": {
    "frontend": {
      "name": "Frontend Development",
      "description": "前端开发相关技能",
      "source": "vercel-labs/agent-skills",
      "skills": [
        "web-design-guidelines",
        "tailwind-design-system",
        "vercel-react-best-practices"
      ]
    },
    "backend": {
      "name": "Backend Development",
      "description": "后端开发相关技能",
      "skills": [
        {
          "name": "nodejs-backend-patterns",
          "source": "vercel-labs/agent-skills"
        },
        {
          "name": "custom-db-helper",
          "source": "my-org/db-skills"
        }
      ]
    }
  }
}
```

### Configuration Format

**Group fields:**
- `name`: Display name (required)
- `description`: Description (optional)
- `source`: Default source for skills (optional)
- `skills`: Array of skills (required)

**Skill formats:**
1. **Simple** (string): Uses group's default source
   ```json
   "web-design-guidelines"
   ```

2. **Explicit** (object): Specifies its own source
   ```json
   {
     "name": "custom-skill",
     "source": "owner/repo"
   }
   ```

**Supported sources:**
- GitHub shorthand: `vercel-labs/agent-skills`
- Full URL: `https://github.com/org/repo`
- GitLab: `https://gitlab.com/org/repo`
- Local path: `./my-skills`

## Commands

### Install

```bash
# Install entire group
skills-manager install --group frontend

# Install multiple groups
skills-manager install --group frontend,backend

# Install single skill (requires --group and --source)
skills-manager install web-design-guidelines --group frontend --source vercel-labs/agent-skills

# Override source for testing
skills-manager install --group frontend --source my-fork/agent-skills

# Pass options to skills CLI
skills-manager install --group frontend --global --agent cursor
```

**Behavior:**
- If config doesn't exist, creates it automatically
- If group doesn't exist, prompts to create it interactively
- Single skill installs also add to config (with confirmation)

### Remove

```bash
# Remove entire group (config preserved)
skills-manager remove --group frontend

# Remove multiple groups
skills-manager remove --group frontend,backend

# Remove single skill (keeps config)
skills-manager remove web-design-guidelines --group frontend

# Interactive remove
skills-manager remove

# Pass options to skills CLI
skills-manager remove --group frontend --global --agent cursor
```

**Behavior:**
- `remove --group`: Uninstalls skills but **keeps configuration**
- `remove skill --group`: Uninstalls skill but **keeps configuration**
- Use `install --group` to reinstall removed groups

### List & Show

```bash
# List all groups
skills-manager list

# Show group details
skills-manager show frontend
```

### Create & Edit

```bash
# Create new group (interactive)
skills-manager create

# Edit existing group (interactive)
skills-manager edit frontend
```

Edit options:
- Change group name
- Edit description
- Edit default source
- Add/remove skills

### Config

```bash
# Show config path and info
skills-manager config

# Open in editor
skills-manager config --edit

# Validate format
skills-manager config --validate

# Reset to defaults
skills-manager config --reset

# Delete group from config
skills-manager config delete frontend

# Delete skill from group config
skills-manager config delete-skill web-design-guidelines --group frontend
```

**Note:** `config delete` and `config delete-skill` only remove from configuration file. Use `remove` commands to uninstall skills first.

### Sync

```bash
# Interactive sync (check/update)
skills-manager sync
```

## Command Behavior Comparison

| Command | Uninstalls Skills | Modifies Config | Use Case |
|---------|-------------------|-----------------|----------|
| `remove --group frontend` | ✅ | ❌ Keeps config | Temporary removal, can reinstall |
| `remove skill --group frontend` | ✅ | ❌ Keeps config | Remove single skill, config kept |
| `config delete frontend` | ❌ | ✅ Deletes group | Clean up config only |
| `config delete-skill skill --group frontend` | ❌ | ✅ Removes skill | Remove skill from config only |
| `install --group frontend` | N/A | ❌ | Install/reinstall from config |

## Typical Workflows

### 1. Temporary Uninstall

```bash
# Uninstall (config kept)
skills-manager remove --group frontend

# Later, reinstall
skills-manager install --group frontend
```

### 2. Permanently Remove a Skill

```bash
# Uninstall skill (config kept)
skills-manager remove web-design-guidelines --group frontend

# Remove from config if needed
skills-manager config delete-skill web-design-guidelines --group frontend
```

### 3. Complete Cleanup

```bash
# First uninstall
skills-manager remove --group frontend

# Then delete from config
skills-manager config delete frontend
```

### 4. Add Custom Skills

```bash
# Install and add to config
skills-manager install my-custom-skill --group tools --source my-org/skills
```

## Integration with `skills` CLI

Skills Manager is a wrapper around the official `skills` CLI. It:

- Calls `npx skills add` for installations
- Calls `npx skills remove` for uninstallations
- Passes through all options (--global, --agent, --yes)
- Maintains compatibility with direct `skills` usage

You can mix both tools:

```bash
# Use skills-manager for groups
skills-manager install --group frontend

# Use skills directly for one-off installs
npx skills add vercel-labs/agent-skills --skill some-skill
```

## Requirements

- Node.js 18 or higher
- `npx` (comes with Node.js)

## Troubleshooting

### Configuration not found

The tool automatically creates `~/.skills-manager/groups.json` on first run with example groups.

### Skill installation fails

The tool wraps `npx skills`, so any `skills` CLI errors will appear. Common issues:

- Network connectivity
- Invalid source/repository
- Skill not found in source

### Configuration validation errors

```bash
skills-manager config --validate
```

This checks:
- JSON format
- Required fields
- Skill source resolution

## License

MIT

## Related

- [vercel-labs/skills](https://github.com/vercel-labs/skills) - The underlying skills CLI
- [Agent Skills Specification](https://agentskills.io) - Skills format specification
- [Skills Directory](https://skills.sh) - Discover available skills
