import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
const script = resolve('skills/dev/setup-context/scripts/setup-context.sh');
const run = cwd => spawnSync('bash', [script], { cwd, encoding: 'utf8' });
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' });
test('setup creates and preserves workspace, with idempotent local exclusion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'context-'));
  try {
    git(dir, 'init', '-q');
    const exclude = join(dir, '.git/info/exclude');
    writeFileSync(exclude, 'existing');
    assert.equal(run(dir).status, 0);
    for (const name of ['GLOSSARY.md', 'map', 'issues', 'reference']) assert.ok(existsSync(join(dir, '.context', name)), name);
    writeFileSync(join(dir, '.context/GLOSSARY.md'), 'custom');
    assert.equal(run(dir).status, 0);
    assert.equal(readFileSync(join(dir, '.context/GLOSSARY.md'), 'utf8'), 'custom');
    assert.equal(readFileSync(exclude, 'utf8'), 'existing\n/.context\n');
    assert.equal(git(dir, 'status', '--short', '--untracked-files=all', '--', '.context'), '');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('non-git, shared symlink and conflicting entries', () => {
  const dir = mkdtempSync(join(tmpdir(), 'context-'));
  try {
    const shared = join(dir, 'shared'); mkdirSync(shared);
    const project = join(dir, 'project'); mkdirSync(project);
    symlinkSync(shared, join(project, '.context'));
    assert.equal(run(project).status, 0);
    assert.ok(existsSync(join(shared, 'map')));
    rmSync(join(project, '.context'));
    writeFileSync(join(project, '.context'), 'keep');
    assert.notEqual(run(project).status, 0);
    assert.equal(readFileSync(join(project, '.context'), 'utf8'), 'keep');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('tracked context files stop setup without modifying them or exclusion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'context-'));
  try {
    git(dir, 'init', '-q');
    mkdirSync(join(dir, '.context'));
    writeFileSync(join(dir, '.context', 'note'), 'tracked');
    git(dir, 'add', '.context/note');
    const exclude = join(dir, '.git/info/exclude');
    const before = readFileSync(exclude, 'utf8');
    assert.notEqual(run(dir).status, 0);
    assert.equal(readFileSync(exclude, 'utf8'), before);
    assert.equal(readFileSync(join(dir, '.context/note'), 'utf8'), 'tracked');
    assert.equal(existsSync(join(dir, '.context/GLOSSARY.md')), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
