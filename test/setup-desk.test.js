import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
const script = resolve('skills/dev/setup-desk/scripts/setup-desk.sh');
const run = cwd => spawnSync('bash', [script], { cwd, encoding: 'utf8' });
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' });
test('setup creates and preserves workspace, with idempotent local exclusion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'desk-'));
  try {
    git(dir, 'init', '-q');
    const exclude = join(dir, '.git/info/exclude');
    writeFileSync(exclude, 'existing');
    assert.equal(run(dir).status, 0);
    for (const name of ['AGENTS.md', 'CONTEXT.md', 'arch', 'specs', 'handoffs', 'refs', 'research']) assert.ok(existsSync(join(dir, '.desk', name)), name);
    writeFileSync(join(dir, '.desk/CONTEXT.md'), 'custom');
    assert.equal(run(dir).status, 0);
    assert.equal(readFileSync(join(dir, '.desk/CONTEXT.md'), 'utf8'), 'custom');
    assert.equal(readFileSync(exclude, 'utf8'), 'existing\n/.desk\n');
    assert.equal(git(dir, 'status', '--short', '--untracked-files=all', '--', '.desk'), '');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('non-git, shared symlink and conflicting entries', () => {
  const dir = mkdtempSync(join(tmpdir(), 'desk-'));
  try {
    const shared = join(dir, 'shared'); mkdirSync(shared);
    const project = join(dir, 'project'); mkdirSync(project);
    symlinkSync(shared, join(project, '.desk'));
    assert.equal(run(project).status, 0);
    assert.ok(existsSync(join(shared, 'arch')));
    rmSync(join(project, '.desk'));
    writeFileSync(join(project, '.desk'), 'keep');
    assert.notEqual(run(project).status, 0);
    assert.equal(readFileSync(join(project, '.desk'), 'utf8'), 'keep');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('tracked desk files stop setup without modifying them or exclusion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'desk-'));
  try {
    git(dir, 'init', '-q');
    mkdirSync(join(dir, '.desk'));
    writeFileSync(join(dir, '.desk', 'note'), 'tracked');
    git(dir, 'add', '.desk/note');
    const exclude = join(dir, '.git/info/exclude');
    const before = readFileSync(exclude, 'utf8');
    assert.notEqual(run(dir).status, 0);
    assert.equal(readFileSync(exclude, 'utf8'), before);
    assert.equal(readFileSync(join(dir, '.desk/note'), 'utf8'), 'tracked');
    assert.equal(existsSync(join(dir, '.desk/AGENTS.md')), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
