# Contributing to Skills Manager

Thank you for considering contributing to Skills Manager!

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skills-manage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Link for local testing**
   ```bash
   npm link
   ```

5. **Test the CLI**
   ```bash
   skills-manager --help
   ```

## Project Structure

```
skills-manage/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── types.ts            # TypeScript types & Zod schemas
│   ├── commands/           # Command implementations
│   └── utils/              # Utility functions
├── bin/
│   └── cli.js             # Executable entry point
├── dist/                   # Compiled output (gitignored)
└── package.json           # NPM configuration
```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit files in `src/`
   - Follow TypeScript best practices
   - Maintain consistent code style

3. **Build and test**
   ```bash
   npm run build
   npm run type-check
   ```

4. **Test manually**
   ```bash
   node dist/cli.js <command>
   ```

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Use async/await for asynchronous operations
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Adding a New Command

1. **Create command file**
   ```typescript
   // src/commands/my-command.ts
   export async function myCommand(args: any): Promise<void> {
     // Implementation
   }
   ```

2. **Register in CLI**
   ```typescript
   // src/cli.ts
   import { myCommand } from './commands/my-command.js';
   
   program
     .command('my-command')
     .description('Description of my command')
     .action(myCommand);
   ```

3. **Build and test**
   ```bash
   npm run build
   skills-manager my-command --help
   ```

### Adding Utilities

1. **Create utility file**
   ```typescript
   // src/utils/my-util.ts
   export function myUtility(param: string): string {
     // Implementation
   }
   ```

2. **Import where needed**
   ```typescript
   import { myUtility } from '../utils/my-util.js';
   ```

## Testing

### Manual Testing

Since this is a CLI tool, manual testing is the primary method:

1. **Test all commands**
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

2. **Test error cases**
   - Invalid group names
   - Missing required options
   - Non-existent groups
   - Invalid configuration

3. **Test edge cases**
   - Empty configuration
   - Configuration with errors
   - Network failures (if applicable)
   - Permission errors

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

## Commit Guidelines

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(install): add support for custom sources
fix(config): handle missing config file gracefully
docs(readme): update installation instructions
refactor(commands): extract common validation logic
```

## Pull Request Process

1. **Update documentation**
   - Update README.md if adding features
   - Update EXAMPLES.md with usage examples
   - Add JSDoc comments to new functions

2. **Ensure code quality**
   - Build succeeds: `npm run build`
   - Type check passes: `npm run type-check`
   - Manual testing completed

3. **Create pull request**
   - Write clear PR description
   - Link related issues
   - List changes made
   - Add screenshots if UI changes

4. **Code review**
   - Address review feedback
   - Keep commits organized
   - Squash commits if requested

## Release Process

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm
5. Create GitHub release

## Questions?

If you have questions about contributing:

- Open an issue for discussion
- Check existing issues and PRs
- Review documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
