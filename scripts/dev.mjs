import { spawn } from 'node:child_process';

const children = ['@endorsement/api', '@endorsement/web'].map((workspace) =>
  spawn('npm', ['run', 'dev', '--workspace', workspace], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }),
);

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', () => stop(1));
  child.on('exit', (code) => stop(code ?? 1));
}
process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));
