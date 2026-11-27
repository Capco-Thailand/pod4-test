import { spawnSync } from 'node:child_process';
import { copyFile, cp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const parts = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Bangkok',
  dateStyle: 'short',
  timeStyle: 'medium',
  hour12: false,
})
  .format(new Date())
  .replaceAll(/[^0-9]/g, '-');
const result = spawnSync(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test'],
  { stdio: 'inherit' },
);
const folder = join('test-results', 'fr-03');
try {
  await mkdir(folder, { recursive: true });
  const name = `${parts}.html`;
  await copyFile(join(folder, 'current', 'index.html'), join(folder, name));
  await cp(join(folder, 'current', 'data'), join(folder, 'data'), {
    recursive: true,
    force: true,
  });
  await writeFile(
    join('test-results', 'index.html'),
    `<!doctype html><meta http-equiv="refresh" content="0;url=fr-03/${name}"><a href="fr-03/${name}">Latest FR-03 report</a>`,
  );
} catch (error) {
  console.error('Could not archive Playwright report:', error);
}
process.exit(result.status ?? 1);
