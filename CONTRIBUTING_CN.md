# 贡献指南

感谢您考虑为 Skills Manager 贡献代码！

## 开发设置

### 前提条件

- Node.js 18 或更高版本
- npm 或 pnpm

### 开始步骤

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd skills-manage
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建项目**
   ```bash
   npm run build
   ```

4. **链接以本地测试**
   ```bash
   npm link
   ```

5. **测试 CLI**
   ```bash
   skills-manager --help
   ```

## 项目结构

```
skills-manage/
├── src/
│   ├── cli.ts              # CLI 主入口
│   ├── types.ts            # TypeScript 类型 & Zod schemas
│   ├── commands/           # 命令实现
│   └── utils/              # 工具函数
├── bin/
│   └── cli.js             # 可执行入口
├── dist/                   # 编译输出（gitignored）
└── package.json           # NPM 配置
```

## 开发工作流程

### 修改代码

1. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **进行修改**
   - 编辑 `src/` 中的文件
   - 遵循 TypeScript 最佳实践
   - 保持一致的代码风格

3. **构建和测试**
   ```bash
   npm run build
   npm run type-check
   ```

4. **手动测试**
   ```bash
   node dist/cli.js <command>
   ```

### 代码风格

- 使用 TypeScript 严格模式
- 遵循现有命名约定
- 使用 async/await 处理异步操作
- 为复杂函数添加 JSDoc 注释
- 保持函数小而专注

### 添加新命令

1. **创建命令文件**
   ```typescript
   // src/commands/my-command.ts
   export async function myCommand(args: any): Promise<void> {
     // 实现
   }
   ```

2. **在 CLI 中注册**
   ```typescript
   // src/cli.ts
   import { myCommand } from './commands/my-command.js';

   program
     .command('my-command')
     .description('命令描述')
     .action(myCommand);
   ```

3. **构建和测试**
   ```bash
   npm run build
   skills-manager my-command --help
   ```

### 添加工具函数

1. **创建工具文件**
   ```typescript
   // src/utils/my-util.ts
   export function myUtility(param: string): string {
     // 实现
   }
   ```

2. **在需要的地方导入**
   ```typescript
   import { myUtility } from '../utils/my-util.js';
   ```

## 测试

### 手动测试

由于这是 CLI 工具，手动测试是主要方法：

1. **测试所有命令**
   ```bash
   skills-manager list
   skills-manager show <group>
   skills-manager install --group <group>
   skills-manager remove --group <group>
   skills-manager create
   skills-manager edit <group>
   skills-manager config
   skills-manager sync
   ```

2. **测试错误情况**
   - 无效分组名称
   - 缺少必填选项
   - 不存在的分组
   - 无效配置

3. **测试边缘情况**
   - 空配置
   - 配置错误
   - 网络故障（如适用）
   - 权限错误

### 类型检查

运行 TypeScript 类型检查：

```bash
npm run type-check
```

## 提交指南

### 提交消息

遵循规范提交格式：

```
类型(范围): 主题

正文（可选）

页脚（可选）
```

**类型：**
- `feat`：新功能
- `fix`：Bug 修复
- `docs`：文档变更
- `style`：代码风格变更（格式化）
- `refactor`：代码重构
- `perf`：性能改进
- `test`：添加测试
- `chore`：维护任务

**示例：**
```
feat(install): 添加自定义来源支持
fix(config): 优雅处理缺失配置文件
docs(readme): 更新安装说明
refactor(commands): 提取通用验证逻辑
```

## Pull Request 流程

1. **更新文档**
   - 如添加功能，更新 README.md
   - 在 EXAMPLES.md 中添加使用示例
   - 为新函数添加 JSDoc 注释

2. **确保代码质量**
   - 构建成功：`npm run build`
   - 类型检查通过：`npm run type-check`
   - 手动测试完成

3. **创建 Pull Request**
   - 写清晰的 PR 描述
   - 关联相关 issue
   - 列出变更内容
   - 如有 UI 变化，添加截图

4. **代码审查**
   - 处理审查反馈
   - 保持提交有序
   - 如要求，压缩提交

## 发布流程

发布由维护者处理：

1. 更新 `package.json` 版本
2. 更新 CHANGELOG.md
3. 创建 git 标签
4. 发布到 npm
5. 创建 GitHub release

## 问题？

如有关于贡献的问题：

- 开启 issue 讨论
- 查看现有 issue 和 PR
- 查阅文档

## 许可证

通过贡献，您同意您的贡献将在 MIT 许可证下授权。