import pc from 'picocolors';

export function success(message: string): void {
  console.log(pc.green('✓'), message);
}

export function error(message: string): void {
  console.log(pc.red('✗'), message);
}

export function info(message: string): void {
  console.log(pc.blue('ℹ'), message);
}

export function warn(message: string): void {
  console.log(pc.yellow('⚠'), message);
}

export function step(message: string): void {
  console.log(pc.cyan('→'), message);
}

export function heading(message: string): void {
  console.log('\n' + pc.bold(message) + '\n');
}

export function dim(message: string): void {
  console.log(pc.dim(message));
}
