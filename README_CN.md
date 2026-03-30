# Skills Manager 技能管理器

CLI 工具，用于以分组方式管理代理技能，支持批量安装/移除操作。

## 概述

Skills Manager 是 [vercel-labs/skills](https://github.com/vercel-labs/skills) 的封装工具，提供基于分组的批量管理功能。将技能按逻辑分组组织，然后批量安装或移除。

## 特性

- 📦 **分组管理**：将技能按逻辑分组组织
- 🚀 **批量操作**：一次安装或移除整个分组
- ⚙️ **灵活配置**：支持每个分组使用多个来源
- 🔄 **智能默认值**：首次运行自动初始化示例配置
- 🎯 **交互式 CLI**：友好的用户提示和确认
- 💾 **全局配置**：跨项目共享单一配置文件

## 安装

### 全局安装（推荐）

```bash
npm install -g skills-manager
```

### 本地开发安装

用于开发和测试本地代码：

```bash
git clone <repository-url>
cd skills-manager
npm install
npm run build
npm link
```

这会创建全局符号链接，使 `skills-manager` 在全局可用。修改代码后重新构建即可生效：

```bash
npm run build  # 代码修改后重新构建
```

取消链接：

```bash
npm unlink -g skills-manager
```

## 快速开始

```bash
# 列出已配置的分组（首次运行自动创建配置）
skills-manager list

# 安装一个分组
skills-manager install --group frontend

# 创建新分组
skills-manager create

# 显示分组详情
skills-manager show frontend
```

## 配置

配置存储在 `~/.skills-manager/groups.json`。

### 示例配置

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

### 配置格式

**分组字段：**
- `name`：显示名称（必填）
- `description`：描述（可选）
- `source`：技能的默认来源（可选）
- `skills`：技能数组（必填）

**技能格式：**
1. **简单格式**（字符串）：使用分组的默认来源
   ```json
   "web-design-guidelines"
   ```

2. **显式格式**（对象）：指定自己的来源
   ```json
   {
     "name": "custom-skill",
     "source": "owner/repo"
   }
   ```

**支持的来源：**
- GitHub 简写：`vercel-labs/agent-skills`
- 完整 URL：`https://github.com/org/repo`
- GitLab：`https://gitlab.com/org/repo`
- 本地路径：`./my-skills`

## 命令

### 安装 (install)

```bash
# 安装整个分组
skills-manager install --group frontend

# 安装多个分组
skills-manager install --group frontend,backend

# 安装单个技能（需要 --group 和 --source）
skills-manager install web-design-guidelines --group frontend --source vercel-labs/agent-skills

# 覆盖来源用于测试
skills-manager install --group frontend --source my-fork/agent-skills

# 传递选项给 skills CLI
skills-manager install --group frontend --global --agent cursor
```

**行为：**
- 如果配置不存在，自动创建
- 如果分组不存在，交互式提示创建
- 单个技能安装也会添加到配置（需确认）

### 移除 (remove)

```bash
# 移除整个分组（保留配置）
skills-manager remove --group frontend

# 移除多个分组
skills-manager remove --group frontend,backend

# 移除单个技能（保留配置）
skills-manager remove web-design-guidelines --group frontend

# 交互式移除
skills-manager remove

# 传递选项给 skills CLI
skills-manager remove --group frontend --global --agent cursor
```

**行为：**
- `remove --group`：卸载技能但**保留配置**
- `remove skill --group`：卸载技能但**保留配置**
- 使用 `install --group` 可重新安装已移除的分组

### 列表和显示 (list & show)

```bash
# 列出所有分组
skills-manager list

# 显示分组详情
skills-manager show frontend
```

### 创建和编辑 (create & edit)

```bash
# 创建新分组（交互式）
skills-manager create

# 编辑现有分组（交互式）
skills-manager edit frontend
```

编辑选项：
- 更改分组名称
- 编辑描述
- 编辑默认来源
- 添加/移除技能

### 配置管理 (config)

```bash
# 显示配置路径和信息
skills-manager config

# 在编辑器中打开
skills-manager config --edit

# 验证格式
skills-manager config --validate

# 重置为默认值
skills-manager config --reset

# 从配置中删除分组
skills-manager config delete frontend

# 从分组配置中删除技能
skills-manager config delete-skill web-design-guidelines --group frontend
```

**注意：** `config delete` 和 `config delete-skill` 只从配置文件中移除。请先使用 `remove` 命令卸载技能。

### 同步 (sync)

```bash
# 交互式同步（检查/更新）
skills-manager sync
```

## 命令行为对比

| 命令 | 卸载技能 | 修改配置 | 使用场景 |
|------|----------|----------|----------|
| `remove --group frontend` | ✅ | ❌ 保留配置 | 临时移除，可重新安装 |
| `remove skill --group frontend` | ✅ | ❌ 保留配置 | 移除单个技能，保留配置 |
| `config delete frontend` | ❌ | ✅ 删除分组 | 仅清理配置 |
| `config delete-skill skill --group frontend` | ❌ | ✅ 移除技能 | 仅从配置中移除技能 |
| `install --group frontend` | 不适用 | ❌ | 从配置安装/重新安装 |

## 典型工作流程

### 1. 临时卸载

```bash
# 卸载（保留配置）
skills-manager remove --group frontend

# 之后重新安装
skills-manager install --group frontend
```

### 2. 永久移除技能

```bash
# 卸载技能（保留配置）
skills-manager remove web-design-guidelines --group frontend

# 如需要，从配置中移除
skills-manager config delete-skill web-design-guidelines --group frontend
```

### 3. 完全清理

```bash
# 先卸载
skills-manager remove --group frontend

# 然后从配置中删除
skills-manager config delete frontend
```

### 4. 添加自定义技能

```bash
# 安装并添加到配置
skills-manager install my-custom-skill --group tools --source my-org/skills
```

## 与 `skills` CLI 的集成

Skills Manager 是官方 `skills` CLI 的封装工具。它会：

- 调用 `npx skills add` 进行安装
- 调用 `npx skills remove` 进行卸载
- 传递所有选项（--global, --agent, --yes）
- 保持与直接使用 `skills` 的兼容性

可以同时使用两个工具：

```bash
# 用 skills-manager 管理分组
skills-manager install --group frontend

# 直接用 skills 进行一次性安装
npx skills add vercel-labs/agent-skills --skill some-skill
```

## 系统要求

- Node.js 18 或更高版本
- `npx`（随 Node.js 安装）

## 故障排除

### 配置未找到

首次运行时，工具会自动创建 `~/.skills-manager/groups.json` 并包含示例分组。

### 技能安装失败

工具封装了 `npx skills`，所以任何 `skills` CLI 错误都会显示。常见问题：

- 网络连接问题
- 无效的来源/仓库
- 来源中找不到技能

### 配置验证错误

```bash
skills-manager config --validate
```

检查内容：
- JSON 格式
- 必填字段
- 技能来源解析

## 许可证

MIT

## 相关资源

- [vercel-labs/skills](https://github.com/vercel-labs/skills) - 底层 skills CLI
- [Agent Skills 规范](https://agentskills.io) - 技能格式规范
- [Skills 目录](https://skills.sh) - 发现可用技能