# Skills Manager 示例

## 入门指南

### 首次设置

首次运行任何命令时，工具会自动创建配置文件：

```bash
$ skills-manager list

ℹ 未找到配置文件。正在创建默认配置...
✓ 配置已创建于 /Users/username/.skills-manager/groups.json

已配置的分组

frontend (Frontend Development)
  前端开发相关技能
  3 个技能
  默认来源: vercel-labs/agent-skills

backend (Backend Development)
  后端开发相关技能
  2 个技能
  默认来源: vercel-labs/agent-skills

配置位置: /Users/username/.skills-manager/groups.json
```

## 基本用法

### 安装分组

```bash
$ skills-manager install --group frontend

正在安装分组: Frontend Development

→ 正在从 vercel-labs/agent-skills 安装 web-design-guidelines...
✓ 已安装 web-design-guidelines
→ 正在从 vercel-labs/agent-skills 安装 tailwind-design-system...
✓ 已安装 tailwind-design-system
→ 正在从 vercel-labs/agent-skills 安装 vercel-react-best-practices...
✓ 已安装 vercel-react-best-practices

ℹ 分组 "frontend": 3 个成功, 0 个失败
```

### 显示分组详情

```bash
$ skills-manager show frontend

Frontend Development (frontend)

前端开发相关技能

默认来源: vercel-labs/agent-skills

技能列表:

  • web-design-guidelines
    来源: vercel-labs/agent-skills
  • tailwind-design-system
    来源: vercel-labs/agent-skills
  • vercel-react-best-practices
    来源: vercel-labs/agent-skills

ℹ 共计: 3 个技能
```

### 移除分组

```bash
$ skills-manager remove --group frontend

正在移除分组: Frontend Development

→ 正在移除 web-design-guidelines...
✓ 已移除 web-design-guidelines
→ 正在移除 tailwind-design-system...
✓ 已移除 tailwind-design-system
→ 正在移除 vercel-react-best-practices...
✓ 已移除 vercel-react-best-practices

ℹ 分组 "frontend": 3 个已移除, 0 个失败
ℹ 配置已保留。使用 "install --group" 重新安装。
```

## 创建自定义分组

### 交互式创建

```bash
$ skills-manager create

创建新分组

? 分组 ID（小写，无空格): my-tools
? 分组名称: My Development Tools
? 描述（可选）: Tools I use daily
? 默认来源（可选）: vercel-labs/agent-skills
? 技能名称（按 Enter 完成）: git-commit
? 技能来源（留空使用默认值）:
? 添加另一个技能？(Y/n) y
? 技能名称（按 Enter 完成）: playwright-best-practices
? 技能来源（留空使用默认值）:
? 添加另一个技能？(Y/n) n

✓ 分组 "my-tools" 创建成功
ℹ 配置已保存到 /Users/username/.skills-manager/groups.json
ℹ 安装命令: skills-manager install --group my-tools
```

## 高级用法

### 安装单个技能

```bash
$ skills-manager install custom-skill --group my-tools --source owner/repo

正在安装技能: custom-skill

→ 正在从 owner/repo 安装 custom-skill...
✓ 已安装 custom-skill
? 将 "custom-skill" 添加到分组 "my-tools" 的配置中？(Y/n) y
✓ 已添加到配置
```

### 使用覆盖来源安装

测试技能仓库的分支版本：

```bash
$ skills-manager install --group frontend --source my-fork/agent-skills

正在安装分组: Frontend Development

→ 正在从 my-fork/agent-skills 安装 web-design-guidelines...
✓ 已安装 web-design-guidelines
...
```

### 编辑分组

```bash
$ skills-manager edit frontend

编辑分组: Frontend Development

? 您想要做什么？
❯ 更改分组名称
  编辑描述
  编辑默认来源
  添加技能
  移除技能
  取消
```

## 配置管理

### 查看配置

```bash
$ skills-manager config

配置信息

位置: /Users/username/.skills-manager/groups.json
状态: 已存在
分组数: 3

ℹ 可用命令:
  skills-manager config --edit      在编辑器中打开
  skills-manager config --validate  验证格式
  skills-manager config --reset     重置为默认值
  skills-manager config delete <group>  从配置中删除分组
```

### 验证配置

```bash
$ skills-manager config --validate

→ 正在验证配置...
✓ 配置有效
ℹ 发现 3 个分组
✓ 分组 "frontend": OK
✓ 分组 "backend": OK
✓ 分组 "my-tools": OK
```

### 从配置中删除分组

```bash
$ skills-manager config delete my-tools

? 从配置中删除分组 "My Development Tools" (my-tools)？(y/N) y
✓ 已从配置中删除分组 "my-tools"
ℹ 注意: 已安装的技能未移除。请使用 "remove --group" 卸载。
```

### 从分组配置中删除技能

```bash
$ skills-manager config delete-skill web-design-guidelines --group frontend

? 从分组 "Frontend Development" (frontend) 中删除技能 "web-design-guidelines"？(y/N) y
✓ 已从分组 "frontend" 中删除技能 "web-design-guidelines"
ℹ 注意: 已安装的技能未移除。请使用 "remove" 命令卸载。
```

## 多代理操作

### 安装到指定代理

```bash
# 安装到 Cursor
skills-manager install --group frontend --agent cursor

# 全局安装
skills-manager install --group frontend --global

# 组合选项
skills-manager install --group frontend --global --agent cursor --yes
```

### 从指定代理移除

```bash
skills-manager remove --group frontend --agent cursor --global
```

## 同步和更新

### 检查更新

```bash
$ skills-manager sync

同步技能

? 您想要做什么？
❯ 检查更新
  更新所有技能
  取消
```

## 批量操作

### 安装多个分组

```bash
$ skills-manager install --group frontend,backend,ai-tools

正在安装分组: Frontend Development
...
正在安装分组: Backend Development
...
正在安装分组: AI Development Tools
...
```

### 移除多个分组

```bash
$ skills-manager remove --group frontend,backend
```

### 从配置中删除多个分组

```bash
$ skills-manager config delete frontend,backend
```

## 完整工作流程示例

```bash
# 1. 列出可用分组
skills-manager list

# 2. 创建自定义分组
skills-manager create

# 3. 安装分组
skills-manager install --group my-custom-group

# 4. 查看已安装内容
skills-manager show my-custom-group

# 5. 之后临时移除
skills-manager remove --group my-custom-group

# 6. 再之后重新安装
skills-manager install --group my-custom-group

# 7. 永久移除
skills-manager remove --group my-custom-group
skills-manager config delete my-custom-group
```

## 配置文件示例

### 简单配置（全部来自同一来源）

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

### 混合来源配置

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

### 多分组配置

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